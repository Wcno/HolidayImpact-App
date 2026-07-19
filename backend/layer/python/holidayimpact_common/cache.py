"""Get-or-fetch-and-cache helpers shared by all four Lambda handlers.

Every handler is independently resilient: it reads the DynamoDB cache first,
and on a miss fetches from Nager.Date and populates the cache itself, rather
than assuming some other Lambda has already warmed it.
"""
from . import dynamo, nager_client
from .country_rules import apply_country_rules


def get_or_fetch_holidays(country_code: str, year):
    """Returns (holidays, source) where source is 'cache' or 'nager'.

    Country-specific rules are applied at read time on every path, so
    DynamoDB always stores the raw Nager.Date data.
    """
    country_code = country_code.upper()
    cached = dynamo.get_cached_item(country_code, year)
    if cached is not None:
        return apply_country_rules(country_code, year, cached["holidays"]), "cache", cached.get("fetchedAt")

    holidays = nager_client.get_public_holidays(country_code, year)
    item = dynamo.put_cached_item(country_code, year, holidays)
    return apply_country_rules(country_code, year, holidays), "nager", item["fetchedAt"]


def get_or_fetch_holidays_multi(country_codes: list, year):
    """Returns {countryCode: holidays} for a list of countries in one year.

    Uses BatchGetItem for the cache-hit path, then fetches+caches misses
    one at a time via Nager.Date.
    """
    country_codes = [cc.upper() for cc in country_codes]
    cached_items = dynamo.batch_get_cached_items(country_codes, year)

    results = {}
    for cc in country_codes:
        cached = cached_items.get(cc)
        if cached is not None:
            holidays = cached["holidays"]
        else:
            holidays = nager_client.get_public_holidays(cc, year)
            dynamo.put_cached_item(cc, year, holidays)
        results[cc] = apply_country_rules(cc, year, holidays)
    return results
