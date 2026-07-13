#!/usr/bin/env bash
# Deploys HolidayImpact App to AWS using the AWS CLI only (no CloudFormation/SAM/CDK).
# Idempotent-ish: re-running updates Lambda code/config and re-deploys the frontend
# without recreating resources that already exist (table, role, API, Amplify app).
#
# Usage: ./scripts/deploy.sh
# Requires: aws-cli v2 configured with credentials, PowerShell (for zipping on Windows).

set -euo pipefail

REGION="us-east-1"
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
TABLE_NAME="HolidaysDB"
LAYER_NAME="holidayimpact-common"
ROLE_NAME="holidayimpact-lambda-role"
API_NAME="holidayimpact-api"
AMPLIFY_APP_NAME="HolidayImpact-App"
AMPLIFY_BRANCH="main"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
BACKEND_DIR="$REPO_ROOT/backend"
FRONTEND_DIR="$REPO_ROOT/frontend"
# PowerShell and aws-cli's fileb:///file:// need native Windows paths, not Git Bash's
# /c/... form (the native aws.exe / powershell.exe don't get MSYS path translation
# for paths embedded inside a larger string). cygpath -m gives forward-slash Windows
# paths (C:/Users/...), which both accept.
BACKEND_DIR_WIN="$(cygpath -m "$BACKEND_DIR")"
FRONTEND_DIR_WIN="$(cygpath -m "$FRONTEND_DIR")"
SCRATCH_DIR="$(mktemp -d)"
SCRATCH_DIR_WIN="$(cygpath -m "$SCRATCH_DIR")"

declare -A ROUTES=(
  ["holidayimpact-get-holidays"]="/holidays"
  ["holidayimpact-long-weekends"]="/long-weekends"
  ["holidayimpact-compare-countries"]="/compare"
  ["holidayimpact-dashboard-stats"]="/dashboard"
)
declare -A HANDLER_DIRS=(
  ["holidayimpact-get-holidays"]="get_holidays"
  ["holidayimpact-long-weekends"]="long_weekends"
  ["holidayimpact-compare-countries"]="compare_countries"
  ["holidayimpact-dashboard-stats"]="dashboard_stats"
)

echo "== 1. DynamoDB table =="
if aws dynamodb describe-table --table-name "$TABLE_NAME" --region "$REGION" >/dev/null 2>&1; then
  echo "table $TABLE_NAME already exists, skipping"
else
  aws dynamodb create-table \
    --table-name "$TABLE_NAME" \
    --attribute-definitions AttributeName=countryCode,AttributeType=S AttributeName=year,AttributeType=S \
    --key-schema AttributeName=countryCode,KeyType=HASH AttributeName=year,KeyType=RANGE \
    --billing-mode PAY_PER_REQUEST \
    --region "$REGION" >/dev/null
  aws dynamodb wait table-exists --table-name "$TABLE_NAME" --region "$REGION"
  aws dynamodb update-time-to-live \
    --table-name "$TABLE_NAME" \
    --time-to-live-specification "Enabled=true,AttributeName=ttl" \
    --region "$REGION" >/dev/null
  echo "table created with TTL enabled on 'ttl'"
fi

echo "== 2. Lambda layer (shared code) =="
find "$BACKEND_DIR/layer/python" -name "__pycache__" -type d -exec rm -rf {} + 2>/dev/null || true
powershell -NoProfile -Command "
  \$ErrorActionPreference = 'Stop'
  Set-Location '$BACKEND_DIR_WIN/layer'
  if (Test-Path layer.zip) { Remove-Item layer.zip -Force }
  Compress-Archive -Path 'python' -DestinationPath 'layer.zip'
"
LAYER_VERSION_ARN=$(aws lambda publish-layer-version \
  --layer-name "$LAYER_NAME" \
  --description "Shared Nager.Date client, DynamoDB cache, long-weekend + stats logic" \
  --zip-file "fileb://$BACKEND_DIR_WIN/layer/layer.zip" \
  --compatible-runtimes python3.13 python3.12 \
  --region "$REGION" \
  --query LayerVersionArn --output text)
echo "published layer: $LAYER_VERSION_ARN"

echo "== 3. IAM execution role =="
if aws iam get-role --role-name "$ROLE_NAME" >/dev/null 2>&1; then
  echo "role $ROLE_NAME already exists, skipping creation"
else
  cat > "$SCRATCH_DIR/trust-policy.json" <<'EOF'
{
  "Version": "2012-10-17",
  "Statement": [{"Effect": "Allow", "Principal": {"Service": "lambda.amazonaws.com"}, "Action": "sts:AssumeRole"}]
}
EOF
  aws iam create-role --role-name "$ROLE_NAME" \
    --assume-role-policy-document "file://$SCRATCH_DIR_WIN/trust-policy.json" >/dev/null
  aws iam attach-role-policy --role-name "$ROLE_NAME" \
    --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole
  echo "role created, waiting for IAM propagation..."
  sleep 10
fi
ROLE_ARN="arn:aws:iam::$ACCOUNT_ID:role/$ROLE_NAME"

cat > "$SCRATCH_DIR/dynamodb-policy.json" <<EOF
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Action": ["dynamodb:GetItem", "dynamodb:PutItem", "dynamodb:BatchGetItem", "dynamodb:Query"],
    "Resource": "arn:aws:dynamodb:$REGION:$ACCOUNT_ID:table/$TABLE_NAME"
  }]
}
EOF
aws iam put-role-policy --role-name "$ROLE_NAME" \
  --policy-name holidayimpact-dynamodb-access \
  --policy-document "file://$SCRATCH_DIR_WIN/dynamodb-policy.json"

echo "== 4. Lambda functions =="
for fn in "${!ROUTES[@]}"; do
  handler_dir="${HANDLER_DIRS[$fn]}"
  zip_path="$BACKEND_DIR_WIN/functions/$handler_dir.zip"
  powershell -NoProfile -Command "
    \$ErrorActionPreference = 'Stop'
    if (Test-Path '$zip_path') { Remove-Item '$zip_path' -Force }
    Compress-Archive -Path '$BACKEND_DIR_WIN/functions/$handler_dir/handler.py' -DestinationPath '$zip_path'
  "

  if aws lambda get-function --function-name "$fn" --region "$REGION" >/dev/null 2>&1; then
    echo "updating $fn code + layer..."
    aws lambda update-function-code --function-name "$fn" \
      --zip-file "fileb://$zip_path" --region "$REGION" >/dev/null
    aws lambda wait function-updated --function-name "$fn" --region "$REGION"
    aws lambda update-function-configuration --function-name "$fn" \
      --layers "$LAYER_VERSION_ARN" --region "$REGION" >/dev/null
  else
    echo "creating $fn..."
    aws lambda create-function \
      --function-name "$fn" \
      --runtime python3.13 \
      --role "$ROLE_ARN" \
      --handler handler.lambda_handler \
      --zip-file "fileb://$zip_path" \
      --layers "$LAYER_VERSION_ARN" \
      --timeout 10 \
      --memory-size 256 \
      --environment "Variables={HOLIDAYS_TABLE_NAME=$TABLE_NAME}" \
      --region "$REGION" >/dev/null
    aws lambda wait function-active --function-name "$fn" --region "$REGION"
  fi
done

echo "== 5. API Gateway (HTTP API) =="
API_ID=$(aws apigatewayv2 get-apis --region "$REGION" \
  --query "Items[?Name=='$API_NAME'].ApiId" --output text)
if [ -z "$API_ID" ]; then
  API_ID=$(aws apigatewayv2 create-api \
    --name "$API_NAME" \
    --protocol-type HTTP \
    --cors-configuration 'AllowOrigins=*,AllowMethods=GET,OPTIONS,AllowHeaders=*' \
    --region "$REGION" --query ApiId --output text)
  aws apigatewayv2 create-stage --api-id "$API_ID" --stage-name '$default' \
    --auto-deploy --region "$REGION" >/dev/null
  echo "created API $API_ID"

  for fn in "${!ROUTES[@]}"; do
    path="${ROUTES[$fn]}"
    fn_arn="arn:aws:lambda:$REGION:$ACCOUNT_ID:function:$fn"
    integration_id=$(aws apigatewayv2 create-integration \
      --api-id "$API_ID" --integration-type AWS_PROXY \
      --integration-uri "$fn_arn" --payload-format-version 2.0 \
      --region "$REGION" --query IntegrationId --output text)
    aws apigatewayv2 create-route --api-id "$API_ID" \
      --route-key "GET $path" --target "integrations/$integration_id" \
      --region "$REGION" >/dev/null
    aws lambda add-permission --function-name "$fn" \
      --statement-id "apigateway-invoke" --action lambda:InvokeFunction \
      --principal apigateway.amazonaws.com \
      --source-arn "arn:aws:execute-api:$REGION:$ACCOUNT_ID:$API_ID/*/*$path" \
      --region "$REGION" >/dev/null 2>&1 || true
    echo "wired GET $path -> $fn"
  done
else
  echo "API $API_ID already exists, skipping route setup (functions already updated above)"
fi
API_ENDPOINT="https://$API_ID.execute-api.$REGION.amazonaws.com"
echo "API endpoint: $API_ENDPOINT"

echo "== 6. Build frontend against the API endpoint =="
echo "VITE_API_BASE_URL=$API_ENDPOINT" > "$FRONTEND_DIR/.env.production"
(cd "$FRONTEND_DIR" && npm install --silent && npm run build)

echo "== 7. Amplify app (manual deploy, no GitHub token required) =="
APP_ID=$(aws amplify list-apps --region "$REGION" \
  --query "apps[?name=='$AMPLIFY_APP_NAME'].appId" --output text)
if [ -z "$APP_ID" ]; then
  APP_ID=$(aws amplify create-app --name "$AMPLIFY_APP_NAME" --region "$REGION" \
    --query "app.appId" --output text)
  aws amplify update-app --app-id "$APP_ID" \
    --custom-rules '[{"source":"/<*>","target":"/index.html","status":"200"}]' \
    --region "$REGION" >/dev/null
  aws amplify create-branch --app-id "$APP_ID" --branch-name "$AMPLIFY_BRANCH" \
    --region "$REGION" >/dev/null
  echo "created Amplify app $APP_ID"
fi

powershell -NoProfile -Command "
  \$ErrorActionPreference = 'Stop'
  \$zipPath = '$FRONTEND_DIR_WIN/dist.zip'
  if (Test-Path \$zipPath) { Remove-Item \$zipPath -Force }
  Compress-Archive -Path '$FRONTEND_DIR_WIN/dist/*' -DestinationPath \$zipPath
"

DEPLOY_INFO=$(aws amplify create-deployment --app-id "$APP_ID" --branch-name "$AMPLIFY_BRANCH" --region "$REGION")
JOB_ID=$(echo "$DEPLOY_INFO" | python -c "import json,sys; print(json.load(sys.stdin)['jobId'])")
ZIP_UPLOAD_URL=$(echo "$DEPLOY_INFO" | python -c "import json,sys; print(json.load(sys.stdin)['zipUploadUrl'])")
curl -s -X PUT -T "$FRONTEND_DIR_WIN/dist.zip" "$ZIP_UPLOAD_URL" >/dev/null
aws amplify start-deployment --app-id "$APP_ID" --branch-name "$AMPLIFY_BRANCH" \
  --job-id "$JOB_ID" --region "$REGION" >/dev/null

echo "waiting for Amplify deployment..."
for i in $(seq 1 24); do
  status=$(aws amplify get-job --app-id "$APP_ID" --branch-name "$AMPLIFY_BRANCH" \
    --job-id "$JOB_ID" --region "$REGION" --query 'job.summary.status' --output text)
  echo "  status: $status"
  if [ "$status" = "SUCCEED" ] || [ "$status" = "FAILED" ]; then
    break
  fi
  sleep 5
done

echo ""
echo "=========================================="
echo " Deployment complete"
echo " API:      $API_ENDPOINT"
echo " Frontend: https://$AMPLIFY_BRANCH.$APP_ID.amplifyapp.com"
echo "=========================================="
