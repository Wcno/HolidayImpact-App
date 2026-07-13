from holidayimpact_common.cache import get_or_fetch_holidays_multi
from holidayimpact_common.stats import compute_comparison
from holidayimpact_common.utils import (
    build_response,
    error_response,
    get_query_params,
    parse_country_code,
    parse_year,
)

MIN_COUNTRIES = 2
MAX_COUNTRIES = 5


def lambda_handler(event, context):
    params = get_query_params(event)
    year = parse_year(params.get("year"))
    raw_countries = params.get("countries") or ""

    codes = []
    for raw in raw_countries.split(","):
        code = parse_country_code(raw)
        if code is not None and code not in codes:
            codes.append(code)

    if year is None:
        return error_response(400, "Missing or invalid 'year' query param")
    if len(codes) < MIN_COUNTRIES:
        return error_response(400, "Provide at least 2 valid 2-letter country codes via 'countries' (comma-separated)")
    if len(codes) > MAX_COUNTRIES:
        return error_response(400, f"Provide at most {MAX_COUNTRIES} country codes")

    try:
        country_holidays_map = get_or_fetch_holidays_multi(codes, year)
    except Exception as e:
        return error_response(502, f"Failed to fetch holiday data: {e}")

    comparison = compute_comparison(country_holidays_map)

    return build_response(200, {
        "year": year,
        "countries": codes,
        **comparison,
    })
