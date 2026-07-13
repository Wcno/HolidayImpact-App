"""Detects long weekends ("puentes") from a year's holiday list.

Algorithm (see docs/DEPLOYMENT.md / README for the full write-up):
  1. Build the set of "days off" = weekends (Sat/Sun) union holiday dates.
  2. For each holiday, expand outward while adjacent days are also off,
     forming a contiguous block. Blocks of >= 3 days are "natural" long
     weekends (covers Monday/Friday holidays and consecutive holidays).
  3. Isolated holidays (block length == 1) on a Tuesday or Thursday can be
     turned into a 4-day weekend by taking a single "bridge" day off
     (the Monday before, or the Friday after, respectively). Wednesday
     holidays are not bridgeable under this single-day-bridge definition.

Known limitation: cross-year boundaries are not considered, since holidays
are fetched and cached one year at a time.
"""
from datetime import date, timedelta

from .utils import parse_date


def detect_long_weekends(holidays: list, year) -> list:
    holiday_by_date = {}
    for h in holidays:
        d = parse_date(h["date"])
        holiday_by_date.setdefault(d, []).append(h)

    holiday_dates = set(holiday_by_date.keys())

    def is_day_off(d: date) -> bool:
        return d.weekday() in (5, 6) or d in holiday_dates

    emitted_blocks = set()
    results = []

    for h_date in sorted(holiday_dates):
        start = h_date
        while is_day_off(start - timedelta(days=1)):
            start -= timedelta(days=1)
        end = h_date
        while is_day_off(end + timedelta(days=1)):
            end += timedelta(days=1)

        block_length = (end - start).days + 1

        if block_length >= 3:
            block_key = (start, end)
            if block_key in emitted_blocks:
                continue
            emitted_blocks.add(block_key)
            block_holiday_dates = sorted(d for d in holiday_dates if start <= d <= end)
            results.append({
                "startDate": start.isoformat(),
                "endDate": end.isoformat(),
                "totalDays": block_length,
                "type": "natural",
                "bridgeDate": None,
                "holidayDates": [d.isoformat() for d in block_holiday_dates],
                "holidayNames": [
                    h["name"] for d in block_holiday_dates for h in holiday_by_date[d]
                ],
            })
        elif block_length == 1:
            weekday = h_date.weekday()  # Mon=0 .. Sun=6
            bridge_date = None
            bridge_start, bridge_end = None, None
            if weekday == 1:  # Tuesday
                bridge_date = h_date - timedelta(days=1)
                bridge_start, bridge_end = h_date - timedelta(days=3), h_date
            elif weekday == 3:  # Thursday
                bridge_date = h_date + timedelta(days=1)
                bridge_start, bridge_end = h_date, h_date + timedelta(days=3)

            if bridge_date is not None:
                block_key = (bridge_start, bridge_end)
                if block_key in emitted_blocks:
                    continue
                emitted_blocks.add(block_key)
                results.append({
                    "startDate": bridge_start.isoformat(),
                    "endDate": bridge_end.isoformat(),
                    "totalDays": (bridge_end - bridge_start).days + 1,
                    "type": "bridge",
                    "bridgeDate": bridge_date.isoformat(),
                    "holidayDates": [h_date.isoformat()],
                    "holidayNames": [h["name"] for h in holiday_by_date[h_date]],
                })

    results.sort(key=lambda r: r["startDate"])
    return results
