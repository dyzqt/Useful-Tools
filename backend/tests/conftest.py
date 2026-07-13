import os
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

TEST_DB = Path(__file__).parent / "test_app.db"
os.environ["APP_DB_PATH"] = str(TEST_DB)

from app.database import init_db  # noqa: E402
from app.main import app  # noqa: E402


@pytest.fixture(autouse=True)
def fresh_db():
    if TEST_DB.exists():
        TEST_DB.unlink()
    init_db(TEST_DB)
    yield
    if TEST_DB.exists():
        TEST_DB.unlink()


@pytest.fixture
def client():
    return TestClient(app)
