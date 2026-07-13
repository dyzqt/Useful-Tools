from datetime import UTC, datetime

from fastapi import APIRouter, HTTPException, Response, status
from pydantic import BaseModel, Field

from app.database import get_connection
from app.utils import utc_now_iso

router = APIRouter(prefix="/api/countdowns", tags=["countdowns"])


class CountdownIn(BaseModel):
    title: str = Field(min_length=1, max_length=120)
    target_at: str
    description: str = ""


class Remaining(BaseModel):
    total_seconds: int
    days: int
    hours: int
    minutes: int


class CountdownOut(CountdownIn):
    id: int
    created_at: str
    updated_at: str
    remaining: Remaining
    is_expired: bool


def _parse_dt(value: str) -> datetime:
    normalized = value.replace("Z", "+00:00")
    dt = datetime.fromisoformat(normalized)
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=UTC)
    return dt.astimezone(UTC)


def _remaining(target_at: str) -> dict:
    target = _parse_dt(target_at)
    seconds = max(0, int((target - datetime.now(UTC)).total_seconds()))
    days, rem = divmod(seconds, 86400)
    hours, rem = divmod(rem, 3600)
    minutes, _ = divmod(rem, 60)
    return {"total_seconds": seconds, "days": days, "hours": hours, "minutes": minutes}


def _decode(row) -> CountdownOut:
    data = dict(row)
    remain = _remaining(data["target_at"])
    data["remaining"] = remain
    data["is_expired"] = remain["total_seconds"] == 0
    return CountdownOut(**data)


@router.post("", response_model=CountdownOut, status_code=status.HTTP_201_CREATED)
def create_countdown(payload: CountdownIn):
    _parse_dt(payload.target_at)
    now = utc_now_iso()
    with get_connection() as conn:
        cur = conn.execute(
            """
            INSERT INTO countdowns (title, target_at, description, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?)
            """,
            (payload.title, payload.target_at, payload.description, now, now),
        )
        row = conn.execute("SELECT * FROM countdowns WHERE id=?", (cur.lastrowid,)).fetchone()
    return _decode(row)


@router.get("")
def list_countdowns():
    with get_connection() as conn:
        rows = conn.execute("SELECT * FROM countdowns ORDER BY target_at ASC, id DESC").fetchall()
    items = [_decode(row).model_dump() for row in rows]
    return {"total": len(items), "items": items}


@router.get("/{countdown_id}", response_model=CountdownOut)
def get_countdown(countdown_id: int):
    with get_connection() as conn:
        row = conn.execute("SELECT * FROM countdowns WHERE id=?", (countdown_id,)).fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="countdown not found")
    return _decode(row)


@router.put("/{countdown_id}", response_model=CountdownOut)
def update_countdown(countdown_id: int, payload: CountdownIn):
    _parse_dt(payload.target_at)
    now = utc_now_iso()
    with get_connection() as conn:
        existing = conn.execute("SELECT id FROM countdowns WHERE id=?", (countdown_id,)).fetchone()
        if not existing:
            raise HTTPException(status_code=404, detail="countdown not found")
        conn.execute(
            """
            UPDATE countdowns SET title=?, target_at=?, description=?, updated_at=? WHERE id=?
            """,
            (payload.title, payload.target_at, payload.description, now, countdown_id),
        )
        row = conn.execute("SELECT * FROM countdowns WHERE id=?", (countdown_id,)).fetchone()
    return _decode(row)


@router.delete("/{countdown_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_countdown(countdown_id: int):
    with get_connection() as conn:
        cur = conn.execute("DELETE FROM countdowns WHERE id=?", (countdown_id,))
        if cur.rowcount == 0:
            raise HTTPException(status_code=404, detail="countdown not found")
    return Response(status_code=status.HTTP_204_NO_CONTENT)
