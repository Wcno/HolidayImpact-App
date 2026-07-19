from holidayimpact_common.cache import get_or_fetch_holidays
from holidayimpact_common.country_rules import suggests_bridge_days
from holidayimpact_common.long_weekends import detect_long_weekends
from holidayimpact_common.utils import build_response, error_response, parse_country_year


def lambda_handler(event, context):
    country, year, error = parse_country_year(event)
    if error:
        return error

    try:
        holidays, _source, _fetched_at = get_or_fetch_holidays(country, year)
    except Exception as e:
        return error_response(502, f"Failed to fetch holiday data: {e}")

    long_weekends = detect_long_weekends(holidays, year, suggests_bridge_days(country))

    return build_response(200, {
        "country": country,
        "year": year,
        "longWeekendCount": len(long_weekends),
        "longWeekends": long_weekends,
    })
