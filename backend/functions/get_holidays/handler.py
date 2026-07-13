from holidayimpact_common.cache import get_or_fetch_holidays
from holidayimpact_common.utils import build_response, error_response, parse_country_year


def lambda_handler(event, context):
    country, year, error = parse_country_year(event)
    if error:
        return error

    try:
        holidays, source, fetched_at = get_or_fetch_holidays(country, year)
    except Exception as e:
        return error_response(502, f"Failed to fetch holiday data: {e}")

    return build_response(200, {
        "country": country,
        "year": year,
        "count": len(holidays),
        "holidays": holidays,
        "source": source,
        "fetchedAt": fetched_at,
    })
