"""Thin client for the free Nager.Date public holiday API (https://date.nager.at)."""
import json
import urllib.error
import urllib.request

BASE_URL = "https://date.nager.at/api/v3"
TIMEOUT_SECONDS = 6


class NagerClientError(Exception):
    pass


def _get_json(url: str):
    last_error = None
    for attempt in range(2):
        try:
            req = urllib.request.Request(url, headers={"Accept": "application/json"})
            with urllib.request.urlopen(req, timeout=TIMEOUT_SECONDS) as resp:
                if resp.status == 204:
                    return []
                return json.loads(resp.read().decode("utf-8"))
        except urllib.error.HTTPError as e:
            if e.code == 404:
                return []
            last_error = e
        except (urllib.error.URLError, TimeoutError) as e:
            last_error = e
    raise NagerClientError(f"Failed to fetch {url}: {last_error}")


def get_public_holidays(country_code: str, year: int):
    """Returns the raw Nager.Date list of holidays for a country/year, or [] if unknown."""
    url = f"{BASE_URL}/PublicHolidays/{year}/{country_code.upper()}"
    return _get_json(url)


def get_available_countries():
    url = f"{BASE_URL}/AvailableCountries"
    return _get_json(url)
