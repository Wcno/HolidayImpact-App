from datetime import date

from holidayimpact_common.stats import compute_comparison, compute_dashboard_stats

CO_HOLIDAYS = [
    {"date": "2026-01-01", "localName": "Año Nuevo"},
    {"date": "2026-01-12", "localName": "Día de los Reyes Magos"},
    {"date": "2026-07-20", "localName": "Día de la Independencia"},
]


def test_dashboard_stats_totals_and_breakdowns():
    stats = compute_dashboard_stats(CO_HOLIDAYS, 2026, today=date(2026, 1, 1))
    assert stats["totalHolidays"] == 3
    assert stats["byMonth"]["01"] == 2
    assert stats["byMonth"]["07"] == 1
    assert sum(stats["byMonth"].values()) == 3
    assert sum(stats["byWeekday"].values()) == 3


def test_dashboard_stats_next_holiday_and_days_remaining():
    stats = compute_dashboard_stats(CO_HOLIDAYS, 2026, today=date(2026, 1, 2))
    assert stats["nextHoliday"]["date"] == "2026-01-12"
    assert stats["nextHoliday"]["daysRemaining"] == 10


def test_dashboard_stats_next_holiday_is_none_when_year_is_over():
    stats = compute_dashboard_stats(CO_HOLIDAYS, 2026, today=date(2027, 1, 1))
    assert stats["nextHoliday"] is None


def test_dashboard_stats_includes_long_weekend_count():
    stats = compute_dashboard_stats(CO_HOLIDAYS, 2026, today=date(2026, 1, 1))
    assert "longWeekendCount" in stats
    assert isinstance(stats["longWeekendCount"], int)


def test_compute_comparison_finds_common_holidays():
    co = [{"date": "2026-01-01", "localName": "Año Nuevo"}]
    us = [{"date": "2026-01-01", "localName": "New Year's Day"}, {"date": "2026-07-04", "localName": "Independence Day"}]

    comparison = compute_comparison({"CO": co, "US": us})

    assert comparison["summary"] == {"CO": 1, "US": 2}
    assert len(comparison["commonHolidays"]) == 1
    assert comparison["commonHolidays"][0]["date"] == "2026-01-01"
    assert comparison["commonHolidays"][0]["namesByCountry"] == {
        "CO": "Año Nuevo",
        "US": "New Year's Day",
    }


def test_compute_comparison_no_overlap():
    co = [{"date": "2026-07-20", "localName": "Independencia"}]
    us = [{"date": "2026-07-04", "localName": "Independence Day"}]

    comparison = compute_comparison({"CO": co, "US": us})
    assert comparison["commonHolidays"] == []
