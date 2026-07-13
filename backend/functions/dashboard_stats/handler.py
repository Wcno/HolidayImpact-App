from holidayimpact_common.cache import get_or_fetch_holidays
from holidayimpact_common.stats import compute_dashboard_stats
from holidayimpact_common.utils import (
    build_response,
    error_response,
    get_query_params,
    parse_country_code,
    parse_year,
)


def lambda_handler(event, context):
    params = get_query_params(event)
    country = parse_country_code(params.get("country"))
    year = parse_year(params.get("year"))

    if country is None:
        return error_response(400, "Missing or invalid 'country' query param (2-letter ISO code)")
    if year is None:
        return error_response(400, "Missing or invalid 'year' query param")

    try:
        holidays, _source, _fetched_at = get_or_fetch_holidays(country, year)
    except Exception as e:
        return error_response(502, f"Failed to fetch holiday data: {e}")

    stats = compute_dashboard_stats(holidays, year)

    return build_response(200, {
        "country": country,
        "year": year,
        **stats,
    })
