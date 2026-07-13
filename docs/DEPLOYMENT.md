# Despliegue en AWS

HolidayImpact App se despliega usando **AWS CLI directamente** (sin CloudFormation, SAM, CDK ni Serverless Framework). Toda la infraestructura se crea con comandos `aws` individuales, documentados y automatizados en [`scripts/deploy.sh`](../scripts/deploy.sh).

## Arquitectura desplegada

```
Usuarios → AWS Amplify (React, hosting estático)
              │
              ▼
        Amazon API Gateway (HTTP API)
              │
   ┌──────────┼──────────┬──────────────┐
   ▼          ▼          ▼              ▼
GetHolidays  LongWeekends CompareCountries DashboardStats   (AWS Lambda, Python 3.13)
   │          │          │              │
   └──────────┴──────────┴──────────────┘
              │
              ▼
      Amazon DynamoDB (HolidaysDB)
              │
              ▼
      Nager.Date API (date.nager.at) — solo en cache miss
```

Las 4 Lambdas comparten lógica (cliente Nager.Date, acceso a DynamoDB, algoritmo de
fines de semana largos, cálculo de métricas) a través de un **Lambda Layer**
(`holidayimpact-common`), en vez de duplicar código.

## Requisitos previos

- AWS CLI v2 instalado y configurado (`aws sts get-caller-identity` debe funcionar)
- Node.js 18+ y npm (para compilar el frontend)
- PowerShell (usado por el script para empaquetar los .zip en Windows)

## Despliegue automatizado

```bash
./scripts/deploy.sh
```

El script es idempotente: si un recurso ya existe (tabla, rol, API), no lo vuelve a
crear; para las Lambdas y el frontend, actualiza el código y vuelve a desplegar.

## Qué hace el script, paso a paso

1. **DynamoDB**: crea la tabla `HolidaysDB` (PK `countryCode` string, SK `year`
   string, modo on-demand) y habilita TTL sobre el atributo `ttl` (cache de 30 días).
2. **Lambda Layer**: empaqueta `backend/layer/python/holidayimpact_common` en un
   zip y lo publica como capa (`holidayimpact-common`), compatible con
   `python3.13`/`python3.12`.
3. **Rol IAM**: crea `holidayimpact-lambda-role` con `AWSLambdaBasicExecutionRole`
   (logs) más una política inline con `GetItem`/`PutItem`/`BatchGetItem`/`Query`
   acotada al ARN de `HolidaysDB`. Importante: estas Lambdas **no** están en una
   VPC — si se agregan a una VPC sin NAT Gateway, las llamadas salientes a
   `date.nager.at` fallarán.
4. **4 funciones Lambda**: `holidayimpact-get-holidays`,
   `holidayimpact-long-weekends`, `holidayimpact-compare-countries`,
   `holidayimpact-dashboard-stats`. Runtime Python 3.13, handler
   `handler.lambda_handler`, capa adjunta, rol adjunto, variable de entorno
   `HOLIDAYS_TABLE_NAME=HolidaysDB`, timeout 10s, memoria 256MB.
5. **API Gateway (HTTP API)**: crea las rutas `GET /holidays`,
   `GET /long-weekends`, `GET /compare`, `GET /dashboard`, cada una con
   integración `AWS_PROXY` hacia su Lambda; CORS configurado a nivel de API
   (`*` origins/métodos GET,OPTIONS); stage `$default` con auto-deploy.
6. **Frontend**: escribe `frontend/.env.production` con la URL real del API
   Gateway y corre `npm run build`.
7. **Amplify**: crea la app (`HolidayImpact-App`), agrega la regla de reescritura
   SPA (`/<*>` → `/index.html`, status 200, necesaria para que las rutas de
   React Router como `/dashboard` no den 404 al refrescar), y despliega el
   `dist/` compilado mediante **despliegue manual por zip**
   (`create-deployment` → `PUT` del zip a la URL firmada → `start-deployment`) —
   esto evita tener que conectar un token de GitHub.

## Por qué despliegue manual de Amplify (sin conectar GitHub)

Conectar Amplify a un repositorio de GitHub vía CLI requiere un token de acceso
personal de GitHub (`--access-token`/`--oauth-token`). Para evitar manejar
credenciales de GitHub en este flujo, se usa el modo de **despliegue manual**
de Amplify: se sube un `.zip` del build directamente. Si más adelante se quiere
CI/CD automático en cada push, se puede conectar el repo desde la consola de
Amplify (Hosting → conectar rama) sin perder la configuración ya creada.

## Verificación end-to-end

```bash
API_URL="<tu API endpoint>"
curl "$API_URL/holidays?country=PA&year=2026"
curl "$API_URL/long-weekends?country=CO&year=2026"
curl "$API_URL/compare?countries=CO,US,MX&year=2026"
curl "$API_URL/dashboard?country=PA&year=2026"
```

Luego abre la URL de Amplify (`https://main.<app-id>.amplifyapp.com`) y navega
las 4 páginas.

## Redeploy tras cambios de código

- Cambios en `backend/layer` o `backend/functions`: correr `./scripts/deploy.sh`
  de nuevo — actualiza el código de las Lambdas y la capa.
- Cambios en `frontend/`: correr `./scripts/deploy.sh` — recompila y vuelve a
  subir el `dist/` a Amplify.

## Costos

Todos los servicios usados (DynamoDB on-demand, Lambda, API Gateway HTTP API,
Amplify Hosting) tienen capa gratuita generosa en AWS; para el volumen de tráfico
de un proyecto de curso, el costo esperado es $0.
