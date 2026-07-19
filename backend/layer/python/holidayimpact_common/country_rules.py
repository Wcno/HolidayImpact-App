"""Country-specific holiday rules, applied at read time (never persisted).

Only Panama (PA) has special rules today:
  - "Día de Duelo Nacional" (Dec 20, in force since 2022) is missing from
    Nager.Date, so it is injected here.
  - A holiday that falls on a Sunday is observed on the following Monday
    (Labor Code compensatory rest). The holiday keeps its real date; the
    Monday is exposed as an extra `observedDate` field.
  - Panama's only "puente" is that Sunday -> Monday shift, so the Tue/Thu
    bridge-day suggestions of the long-weekend detector are disabled for PA.
"""
from datetime import timedelta

from .utils import parse_date

MOURNING_DAY_NAME = "National Mourning Day"
MOURNING_DAY_FIRST_YEAR = 2022


def suggests_bridge_days(country_code: str) -> bool:
    """Whether the long-weekend detector should suggest Tue/Thu bridge days."""
    return country_code.upper() != "PA"


def apply_country_rules(country_code: str, year, holidays: list) -> list:
    if country_code.upper() != "PA":
        return holidays
    result = _inject_mourning_day(int(year), list(holidays))
    result = [_with_sunday_shift(h) for h in result]
    result.sort(key=lambda h: h["date"])
    return result


def _inject_mourning_day(year: int, holidays: list) -> list:
    """The duplicate guard makes this self-retiring if Nager.Date ever adds
    the holiday upstream."""
    if year < MOURNING_DAY_FIRST_YEAR:
        return holidays
    date_str = f"{year}-12-20"
    if any(h["date"] == date_str and h["name"] == MOURNING_DAY_NAME for h in holidays):
        return holidays
    holidays.append({
        "date": date_str,
        "localName": "Día de Duelo Nacional",
        "name": MOURNING_DAY_NAME,
        "countryCode": "PA",
        "fixed": True,
        "global": True,
        "counties": None,
        "launchYear": MOURNING_DAY_FIRST_YEAR,
        "types": ["Public"],
    })
    return holidays


def _with_sunday_shift(holiday: dict) -> dict:
    d = parse_date(holiday["date"])
    if d.weekday() != 6:  # Sunday
        return holiday
    return {**holiday, "observedDate": (d + timedelta(days=1)).isoformat()}
