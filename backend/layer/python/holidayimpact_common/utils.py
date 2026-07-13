"""Small shared helpers: date parsing, API Gateway request/response plumbing."""
import json
from datetime import date
from decimal import Decimal

WEEKDAY_NAMES = [
    "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday",
]

CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "*",
    "Content-Type": "application/json",
}


def parse_date(date_str: str) -> date:
    return date.fromisoformat(date_str)


class _DecimalEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, Decimal):
            return int(obj) if obj % 1 == 0 else float(obj)
        return super().default(obj)


def build_response(status_code: int, body: dict) -> dict:
    return {
        "statusCode": status_code,
        "headers": CORS_HEADERS,
        "body": json.dumps(body, cls=_DecimalEncoder),
    }


def error_response(status_code: int, message: str) -> dict:
    return build_response(status_code, {"error": message})


def get_query_params(event: dict) -> dict:
    return event.get("queryStringParameters") or {}


def parse_year(value: str):
    if value is None or not value.isdigit():
        return None
    year = int(value)
    if year < 1900 or year > 2100:
        return None
    return year


def parse_country_code(value: str):
    if value is None:
        return None
    value = value.strip().upper()
    if len(value) != 2 or not value.isalpha():
        return None
    return value
