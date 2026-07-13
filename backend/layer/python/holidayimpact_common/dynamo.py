"""DynamoDB access for the HolidaysDB cache table.

Table schema: partition key countryCode (S), sort key year (S).
Each item holds the full holiday list for that country/year plus cache metadata.
"""
import os
import time
from datetime import datetime, timezone

import boto3

TTL_SECONDS = 30 * 24 * 60 * 60  # 30 days

_table = None


def get_table():
    global _table
    if _table is None:
        table_name = os.environ["HOLIDAYS_TABLE_NAME"]
        _table = boto3.resource("dynamodb").Table(table_name)
    return _table


def get_cached_item(country_code: str, year: str):
    resp = get_table().get_item(Key={"countryCode": country_code, "year": str(year)})
    return resp.get("Item")


def put_cached_item(country_code: str, year: str, holidays: list):
    now = datetime.now(timezone.utc)
    item = {
        "countryCode": country_code,
        "year": str(year),
        "holidays": holidays,
        "holidayCount": len(holidays),
        "fetchedAt": now.isoformat(),
        "ttl": int(time.time()) + TTL_SECONDS,
    }
    get_table().put_item(Item=item)
    return item


def batch_get_cached_items(country_codes: list, year: str):
    """Returns {countryCode: item} for whichever of the requested keys are cached."""
    if not country_codes:
        return {}
    keys = [{"countryCode": cc, "year": str(year)} for cc in country_codes]
    table_name = get_table().table_name
    resource = boto3.resource("dynamodb")
    response = resource.batch_get_item(RequestItems={table_name: {"Keys": keys}})
    items = response.get("Responses", {}).get(table_name, [])
    return {item["countryCode"]: item for item in items}
