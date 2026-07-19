"""Dashboard metrics and country-comparison calculators."""
from datetime import date, datetime, timezone

from .long_weekends import detect_long_weekends
from .utils import WEEKDAY_NAMES, parse_date


def compute_dashboard_stats(holidays: list, year, today: date = None, suggest_bridges: bool = True) -> dict:
    if today is None:
        today = datetime.now(timezone.utc).date()

    by_month = {f"{m:02d}": 0 for m in range(1, 13)}
    by_weekday = {name: 0 for name in WEEKDAY_NAMES}

    parsed = []
    for h in holidays:
        # Charts count the actual holiday date on purpose, even when the day
        # off is observed on another date (observedDate).
        d = parse_date(h["date"])
        parsed.append((d, h))
        by_month[f"{d.month:02d}"] += 1
        by_weekday[WEEKDAY_NAMES[d.weekday()]] += 1

    # Sort by date only. Sorting bare (date, dict) tuples would fall back to
    # comparing the holiday dicts when two share a date (e.g. US/CA regional
    # holidays on the same day), which raises TypeError.
    upcoming = sorted(((d, h) for d, h in parsed if d >= today), key=lambda t: t[0])
    next_holiday = None
    if upcoming:
        d, h = upcoming[0]
        next_holiday = {
            "date": d.isoformat(),
            "name": h["name"],
            "daysRemaining": (d - today).days,
        }
        if h.get("observedDate"):
            next_holiday["observedDate"] = h["observedDate"]

    long_weekends = detect_long_weekends(holidays, year, suggest_bridges)

    return {
        "totalHolidays": len(holidays),
        "byMonth": by_month,
        "byWeekday": by_weekday,
        "nextHoliday": next_holiday,
        "longWeekendCount": len(long_weekends),
    }


def compute_comparison(country_holidays_map: dict) -> dict:
    """country_holidays_map: {countryCode: [holiday, ...]}"""
    results = {}
    by_date = {}
    for country_code, holidays in country_holidays_map.items():
        results[country_code] = {"count": len(holidays), "holidays": holidays}
        for h in holidays:
            by_date.setdefault(h["date"], {})[country_code] = h["name"]

    common_holidays = [
        {"date": d, "namesByCountry": names}
        for d, names in sorted(by_date.items())
        if len(names) > 1
    ]

    summary = {cc: data["count"] for cc, data in results.items()}

    return {
        "results": results,
        "commonHolidays": common_holidays,
        "summary": summary,
    }
