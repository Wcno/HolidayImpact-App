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
DynamoDB (cache de Nager.Date). Ver [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md)
para el detalle completo y cómo desplegar con `./scripts/deploy.sh` (AWS CLI,
sin CloudFormation/SAM/CDK).

## Estructura del repo

```
backend/    # 4 Lambdas Python + layer compartido + tests (pytest/moto)
frontend/   # React (Vite) — 4 páginas: Feriados, Fines largos, Comparar, Dashboard
docs/       # Guía de despliegue
scripts/    # deploy.sh — despliegue vía AWS CLI
```

## Desarrollo local

Backend:
```bash
cd backend && pip install -r requirements-dev.txt && pytest -v
```

Frontend:
```bash
cd frontend && npm install && npm run dev
```
Configura `frontend/.env` (ver `.env.example`) con la URL del API Gateway
desplegado para probar contra datos reales.

## Despliegue

```bash
./scripts/deploy.sh
```
