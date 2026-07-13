from datetime import UTC, datetime
from typing import Any


def utc_now_iso() -> str:
    return datetime.now(UTC).replace(microsecond=0).isoformat()


def row_to_dict(row: Any) -> dict:
    return dict(row)
