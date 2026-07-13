# HolidayImpact App

Aplicación que consume datos públicos de feriados de múltiples países
([Nager.Date API](https://date.nager.at), gratuita y sin API key), los enriquece
con métricas, y los expone mediante una app web interactiva.

## Funcionalidades

- Consultar feriados por país y año
- Detección automática de fines de semana largos ("puentes")
- Comparación de feriados entre países
- Dashboard con métricas adicionales por país (distribución mensual/semanal,
  próximo feriado, cantidad de fines de semana largos)

## Arquitectura

Serverless en AWS: React (Amplify) → API Gateway (HTTP API) → 4 Lambdas Python →
DynamoDB (cache de Nager.Date). El backend ya está aprovisionado en AWS y el
frontend se despliega automáticamente desde GitHub con Amplify en cada push a
`main`. Ver [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) para el detalle de la
infraestructura y su configuración.

## Estructura del repo

```
backend/    # 4 Lambdas Python + layer compartido + tests (pytest/moto)
frontend/   # React (Vite) — Home + 4 páginas: Feriados, Fines largos, Comparar, Dashboard
docs/       # Documentación de la infraestructura
amplify.yml # Build spec de Amplify (monorepo, appRoot: frontend)
```

## Desarrollo local

Backend (tests):
```bash
cd backend && pip install -r requirements-dev.txt && pytest -v
```

Frontend:
```bash
cd frontend && npm install && npm run dev
```
Configura `frontend/.env` (ver `.env.example`) con la URL del API Gateway
para probar contra datos reales.

## Despliegue

- **Frontend**: automático desde GitHub vía AWS Amplify en cada push a `main`.
- **Backend**: ya aprovisionado en AWS (DynamoDB, layer, 4 Lambdas, API Gateway).
  Ver [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) para los detalles.
