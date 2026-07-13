from holidayimpact_common.cache import get_or_fetch_holidays, get_or_fetch_holidays_multi


def test_cache_miss_fetches_from_nager_and_stores(dynamo_table, mock_nager):
    holidays, source, fetched_at = get_or_fetch_holidays("CO", 2026)
    assert source == "nager"
    assert len(holidays) == 5
    assert fetched_at is not None
    mock_nager.assert_called_once_with("CO", 2026)

    item = dynamo_table.get_item(Key={"countryCode": "CO", "year": "2026"}).get("Item")
    assert item is not None
    assert item["holidayCount"] == 5


def test_cache_hit_does_not_call_nager(dynamo_table, mock_nager):
    get_or_fetch_holidays("CO", 2026)  # warms cache
    mock_nager.reset_mock()

    holidays, source, _fetched_at = get_or_fetch_holidays("CO", 2026)
    assert source == "cache"
    assert len(holidays) == 5
    mock_nager.assert_not_called()


def test_multi_uses_batch_get_and_fetches_only_misses(dynamo_table, mock_nager):
    get_or_fetch_holidays("US", 2026)  # pre-warm just US
    mock_nager.reset_mock()

    results = get_or_fetch_holidays_multi(["US", "CO", "MX"], 2026)

    assert set(results.keys()) == {"US", "CO", "MX"}
    assert len(results["US"]) == 4
    assert len(results["CO"]) == 5
    assert len(results["MX"]) == 3
    # Only CO and MX were cache misses.
    called_countries = {call.args[0] for call in mock_nager.call_args_list}
    assert called_countries == {"CO", "MX"}
