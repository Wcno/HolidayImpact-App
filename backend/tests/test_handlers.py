import json

from conftest import load_handler


def api_event(query_params: dict):
    return {"queryStringParameters": query_params, "requestContext": {"http": {"method": "GET"}}}


def test_get_holidays_handler_success(dynamo_table, mock_nager):
    handler = load_handler("get_holidays")
    resp = handler.lambda_handler(api_event({"country": "CO", "year": "2026"}), None)

    assert resp["statusCode"] == 200
    assert resp["headers"]["Access-Control-Allow-Origin"] == "*"
    body = json.loads(resp["body"])
    assert body["country"] == "CO"
    assert body["year"] == 2026
    assert body["count"] == 5
    assert body["source"] == "nager"


def test_get_holidays_handler_missing_params():
    handler = load_handler("get_holidays")
    resp = handler.lambda_handler(api_event({}), None)
    assert resp["statusCode"] == 400


def test_long_weekends_handler_success(dynamo_table, mock_nager):
    handler = load_handler("long_weekends")
    resp = handler.lambda_handler(api_event({"country": "CO", "year": "2026"}), None)

    assert resp["statusCode"] == 200
    body = json.loads(resp["body"])
    assert body["country"] == "CO"
    assert "longWeekends" in body
    assert isinstance(body["longWeekendCount"], int)


def test_dashboard_stats_handler_success(dynamo_table, mock_nager):
    handler = load_handler("dashboard_stats")
    resp = handler.lambda_handler(api_event({"country": "US", "year": "2026"}), None)

    assert resp["statusCode"] == 200
    body = json.loads(resp["body"])
    assert body["totalHolidays"] == 4
    assert "byMonth" in body
    assert "byWeekday" in body
    assert "longWeekendCount" in body


def test_compare_countries_handler_success(dynamo_table, mock_nager):
    handler = load_handler("compare_countries")
    resp = handler.lambda_handler(api_event({"countries": "CO,US,MX", "year": "2026"}), None)

    assert resp["statusCode"] == 200
    body = json.loads(resp["body"])
    assert body["countries"] == ["CO", "US", "MX"]
    assert set(body["summary"].keys()) == {"CO", "US", "MX"}
    assert len(body["commonHolidays"]) >= 1  # all three share Jan 1


def test_compare_countries_handler_requires_at_least_two_countries():
    handler = load_handler("compare_countries")
    resp = handler.lambda_handler(api_event({"countries": "CO", "year": "2026"}), None)
    assert resp["statusCode"] == 400


def test_compare_countries_handler_rejects_too_many_countries():
    handler = load_handler("compare_countries")
    resp = handler.lambda_handler(
        api_event({"countries": "CO,US,MX,PA,BR,AR", "year": "2026"}), None
    )
    assert resp["statusCode"] == 400
