"""Test matrix for the puente/long-weekend algorithm.

Anchor dates in Jan 2026 (verified: 2026-01-05 is a Monday):
  Mon=01-05 Tue=01-06 Wed=01-07 Thu=01-08 Fri=01-09 Sat=01-10 Sun=01-11
  Mon=01-12 Tue=01-13 (second week, used for the consecutive-holidays case)
"""
from holidayimpact_common.long_weekends import detect_long_weekends


def holiday(date_str, name="Test Holiday"):
    return {"date": date_str, "localName": name}


def test_monday_holiday_is_natural_three_day_weekend():
    result = detect_long_weekends([holiday("2026-01-05", "Monday Holiday")], 2026)
    assert len(result) == 1
    lw = result[0]
    assert lw["startDate"] == "2026-01-03"  # Saturday
    assert lw["endDate"] == "2026-01-05"
    assert lw["totalDays"] == 3
    assert lw["type"] == "natural"
    assert lw["bridgeDate"] is None
    assert lw["holidayDates"] == ["2026-01-05"]


def test_friday_holiday_is_natural_three_day_weekend():
    result = detect_long_weekends([holiday("2026-01-09", "Friday Holiday")], 2026)
    assert len(result) == 1
    lw = result[0]
    assert lw["startDate"] == "2026-01-09"
    assert lw["endDate"] == "2026-01-11"  # Sunday
    assert lw["totalDays"] == 3
    assert lw["type"] == "natural"


def test_tuesday_holiday_is_bridge():
    result = detect_long_weekends([holiday("2026-01-06", "Tuesday Holiday")], 2026)
    assert len(result) == 1
    lw = result[0]
    assert lw["startDate"] == "2026-01-03"  # Saturday
    assert lw["endDate"] == "2026-01-06"    # Tuesday
    assert lw["totalDays"] == 4
    assert lw["type"] == "bridge"
    assert lw["bridgeDate"] == "2026-01-05"  # Monday


def test_thursday_holiday_is_bridge():
    result = detect_long_weekends([holiday("2026-01-08", "Thursday Holiday")], 2026)
    assert len(result) == 1
    lw = result[0]
    assert lw["startDate"] == "2026-01-08"  # Thursday
    assert lw["endDate"] == "2026-01-11"    # Sunday
    assert lw["totalDays"] == 4
    assert lw["type"] == "bridge"
    assert lw["bridgeDate"] == "2026-01-09"  # Friday


def test_wednesday_holiday_has_no_puente():
    result = detect_long_weekends([holiday("2026-01-07", "Wednesday Holiday")], 2026)
    assert result == []


def test_consecutive_monday_tuesday_holidays_form_single_block():
    result = detect_long_weekends(
        [holiday("2026-01-12", "Mon Holiday"), holiday("2026-01-13", "Tue Holiday")], 2026
    )
    assert len(result) == 1
    lw = result[0]
    assert lw["startDate"] == "2026-01-10"  # Saturday
    assert lw["endDate"] == "2026-01-13"    # Tuesday
    assert lw["totalDays"] == 4
    assert lw["type"] == "natural"
    assert lw["holidayDates"] == ["2026-01-12", "2026-01-13"]
    assert set(lw["holidayNames"]) == {"Mon Holiday", "Tue Holiday"}


def test_year_with_no_puentes_returns_empty_list():
    result = detect_long_weekends([holiday("2026-01-07", "Wednesday Holiday")], 2026)
    assert result == []


def test_holiday_on_saturday_produces_no_entry():
    result = detect_long_weekends([holiday("2026-01-10", "Saturday Holiday")], 2026)
    assert result == []


def test_empty_holiday_list_returns_empty():
    assert detect_long_weekends([], 2026) == []
