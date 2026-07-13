# Despliegue en AWS

El proyecto tiene dos mitades que se despliegan por caminos distintos:

- **Backend** (DynamoDB + Lambdas + API Gateway): se aprovisiona con AWS CLI vía
  [`scripts/deploy.sh`](../scripts/deploy.sh). Sin CloudFormation/SAM/CDK.
- **Frontend** (React): se despliega **automáticamente desde GitHub** con AWS
  Amplify en cada push a `main`. Nadie lo compila en local.

## Arquitectura

```
Usuarios → AWS Amplify (React, build automático desde GitHub)
              │
              ▼
        Amazon API Gateway (HTTP API)
              │
   ┌──────────┼──────────┬──────────────┐
   ▼          ▼          ▼              ▼
GetHolidays  LongWeekends CompareCountries DashboardStats   (Lambda, Python 3.13)
   │          │          │              │
   └──────────┴──────────┴──────────────┘
              │
              ▼
      Amazon DynamoDB (HolidaysDB, caché con TTL de 30 días)
              │
              ▼
      Nager.Date API (date.nager.at) — solo en cache miss
```

Las 4 Lambdas comparten lógica (cliente Nager.Date, caché en DynamoDB, algoritmo
de fines de semana largos, métricas) mediante un **Lambda Layer**
(`holidayimpact-common`).

---

## Backend — `scripts/deploy.sh`

### Requisitos
- AWS CLI v2 configurado (`aws sts get-caller-identity` debe funcionar)
- PowerShell (el script lo usa para empaquetar los .zip en Windows)

### Uso
```bash
./scripts/deploy.sh
```

Es idempotente: si la tabla, el rol o la API ya existen, no los recrea; para las
Lambdas y el layer, actualiza el código. Pasos que ejecuta:

1. **DynamoDB** `HolidaysDB` (PK `countryCode`, SK `year`, on-demand) + TTL sobre `ttl`.
2. **Lambda Layer** `holidayimpact-common` (código compartido de `backend/layer`).
3. **Rol IAM** `holidayimpact-lambda-role` con logs + acceso `GetItem`/`PutItem`/
   `BatchGetItem`/`Query` acotado a la tabla. Las Lambdas **no** van en una VPC
   (necesitan salida a internet para llamar a `date.nager.at`).
4. **4 funciones Lambda** (Python 3.13, handler `handler.lambda_handler`, layer
   adjunto, env `HOLIDAYS_TABLE_NAME=HolidaysDB`, timeout 10s, memoria 256MB).
5. **API Gateway (HTTP API)** con rutas `GET /holidays`, `/long-weekends`,
   `/compare`, `/dashboard`, integración proxy a cada Lambda, CORS y stage `$default`.

### Verificación
```bash
API="https://<api-id>.execute-api.us-east-1.amazonaws.com"
curl "$API/holidays?country=PA&year=2026"
curl "$API/long-weekends?country=CO&year=2026"
curl "$API/compare?countries=CO,US,MX&year=2026"
curl "$API/dashboard?country=PA&year=2026"
```

---

## Frontend — GitHub → AWS Amplify

El frontend se hostea en Amplify conectado al repo de GitHub. **Cada push a
`main` dispara un build y despliegue automático.** No se usa deploy manual.

Configuración que debe existir en la app de Amplify (ya aprovisionada):

- **Repositorio conectado** a `github.com/Wcno/HolidayImpact-App`, rama `main`,
  con auto-build activado.
- **Build spec**: [`amplify.yml`](../amplify.yml) en la **raíz** del repo, en
  formato monorepo (`appRoot: frontend`) — corre `npm ci && npm run build` dentro
  de `frontend/` y publica `frontend/dist`.
- **Variables de entorno** (en la app de Amplify):
  - `AMPLIFY_MONOREPO_APP_ROOT=frontend` — para que Amplify detecte el monorepo.
  - `VITE_API_BASE_URL=<URL del API Gateway>` — respaldo; también está commiteada
    en `frontend/.env.production`, que es lo que Vite lee en el build de producción.
- **Regla de reescritura SPA** (para que rutas como `/dashboard` no den 404):
  ```
  source: </^[^.]+$|\.(?!(css|gif|ico|jpg|js|png|txt|svg|woff|woff2|ttf|map|json|webp)$)([^.]+$)/>
  target: /index.html
  status: 200
  ```

Si el endpoint del API Gateway cambia, actualiza `frontend/.env.production` (y la
variable `VITE_API_BASE_URL` en Amplify) y haz push — Amplify reconstruye solo.

## Costos

DynamoDB on-demand, Lambda, API Gateway HTTP API y Amplify Hosting tienen capa
gratuita amplia; para el tráfico de un proyecto de curso, el costo esperado es $0.
