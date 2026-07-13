import importlib.util
import json
import os
import sys
from pathlib import Path
from unittest.mock import patch

import boto3
import pytest
from moto import mock_aws

BACKEND_DIR = Path(__file__).resolve().parent.parent
LAYER_PYTHON_DIR = BACKEND_DIR / "layer" / "python"
FUNCTIONS_DIR = BACKEND_DIR / "functions"
FIXTURES_DIR = Path(__file__).resolve().parent / "fixtures"

# Mirrors how Lambda adds /opt/python (the layer) to sys.path at runtime.
if str(LAYER_PYTHON_DIR) not in sys.path:
    sys.path.insert(0, str(LAYER_PYTHON_DIR))

TABLE_NAME = "HolidaysDB"


def load_fixture(name: str):
    with open(FIXTURES_DIR / name, encoding="utf-8") as f:
        return json.load(f)


def load_handler(function_name: str):
    """Loads functions/{function_name}/handler.py as a uniquely-named module.

    Each Lambda function has its own handler.py; a plain `import handler`
    would collide across functions since they share a module name, so each
    is loaded from its file path under a distinct module name instead.
    """
    module_name = f"{function_name}_handler"
    handler_path = FUNCTIONS_DIR / function_name / "handler.py"
    spec = importlib.util.spec_from_file_location(module_name, handler_path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


@pytest.fixture
def dynamo_table():
    os.environ["HOLIDAYS_TABLE_NAME"] = TABLE_NAME
    with mock_aws():
        # Reset the module-level cached table handle from a previous test's mock_aws context.
        from holidayimpact_common import dynamo
        dynamo._table = None

        client = boto3.client("dynamodb", region_name="us-east-1")
        client.create_table(
            TableName=TABLE_NAME,
            AttributeDefinitions=[
                {"AttributeName": "countryCode", "AttributeType": "S"},
                {"AttributeName": "year", "AttributeType": "S"},
            ],
            KeySchema=[
                {"AttributeName": "countryCode", "KeyType": "HASH"},
                {"AttributeName": "year", "KeyType": "RANGE"},
            ],
            BillingMode="PAY_PER_REQUEST",
        )
        yield boto3.resource("dynamodb", region_name="us-east-1").Table(TABLE_NAME)
        dynamo._table = None


@pytest.fixture
def mock_nager():
    fixtures = {
        ("CO", 2026): load_fixture("co_2026.json"),
        ("US", 2026): load_fixture("us_2026.json"),
        ("MX", 2026): load_fixture("mx_2026.json"),
    }

    def fake_get_public_holidays(country_code, year):
        return fixtures.get((country_code.upper(), int(year)), [])

    with patch("holidayimpact_common.nager_client.get_public_holidays", side_effect=fake_get_public_holidays) as mocked:
        yield mocked
