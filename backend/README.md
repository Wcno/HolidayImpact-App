# Backend — HolidayImpact App

4 funciones AWS Lambda (Python 3.13) detrás de API Gateway, compartiendo lógica
a través de un Lambda Layer (`layer/python/holidayimpact_common`).

## Estructura

- `layer/python/holidayimpact_common/` — código compartido: cliente Nager.Date,
  acceso a DynamoDB, cache get-or-fetch, detección de fines de semana largos,
  cálculo de métricas.
- `functions/{get_holidays,long_weekends,compare_countries,dashboard_stats}/handler.py`
  — handlers delgados, solo parsean la request y llaman al layer.

## Notas de diseño

- Sin dependencias de terceros en el layer: `nager_client.py` usa
  `urllib.request` de la librería estándar en vez de `requests`, así no hay que
  compilar/empaquetar wheels para Linux al desplegar desde Windows.
- Cada Lambda es independientemente resiliente: si el item no está en caché en
  DynamoDB, lo busca en Nager.Date y lo cachea, sin depender de que otra Lambda
  lo haya hecho antes.
