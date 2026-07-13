import json
from typing import List

from fastapi import APIRouter, HTTPException, Response, status
from pydantic import BaseModel, Field

from app.database import get_connection
from app.utils import utc_now_iso

router = APIRouter(prefix="/api/memos", tags=["memos"])


class MemoIn(BaseModel):
    title: str = Field(min_length=1, max_length=120)
    content: str = ""
    tags: List[str] = Field(default_factory=list)


class MemoOut(MemoIn):
    id: int
    created_at: str
    updated_at: str


def _decode(row) -> MemoOut:
    data = dict(row)
    data["tags"] = json.loads(data.get("tags") or "[]")
    return MemoOut(**data)


@router.post("", response_model=MemoOut, status_code=status.HTTP_201_CREATED)
def create_memo(payload: MemoIn):
    now = utc_now_iso()
    with get_connection() as conn:
        cur = conn.execute(
            """
            INSERT INTO memos (title, content, tags, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?)
            """,
            (payload.title, payload.content, json.dumps(payload.tags, ensure_ascii=False), now, now),
        )
        row = conn.execute("SELECT * FROM memos WHERE id=?", (cur.lastrowid,)).fetchone()
    return _decode(row)


@router.get("")
def list_memos(q: str | None = None):
    params: list[str] = []
    where = ""
    if q:
        where = "WHERE title LIKE ? OR content LIKE ? OR tags LIKE ?"
        like = f"%{q}%"
        params = [like, like, like]
    with get_connection() as conn:
        rows = conn.execute(
            f"SELECT * FROM memos {where} ORDER BY updated_at DESC, id DESC",
            params,
        ).fetchall()
    items = [_decode(row).model_dump() for row in rows]
    return {"total": len(items), "items": items}


@router.get("/{memo_id}", response_model=MemoOut)
def get_memo(memo_id: int):
    with get_connection() as conn:
        row = conn.execute("SELECT * FROM memos WHERE id=?", (memo_id,)).fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="memo not found")
    return _decode(row)


@router.put("/{memo_id}", response_model=MemoOut)
def update_memo(memo_id: int, payload: MemoIn):
    now = utc_now_iso()
    with get_connection() as conn:
        existing = conn.execute("SELECT id FROM memos WHERE id=?", (memo_id,)).fetchone()
        if not existing:
            raise HTTPException(status_code=404, detail="memo not found")
        conn.execute(
            """
            UPDATE memos SET title=?, content=?, tags=?, updated_at=? WHERE id=?
            """,
            (payload.title, payload.content, json.dumps(payload.tags, ensure_ascii=False), now, memo_id),
        )
        row = conn.execute("SELECT * FROM memos WHERE id=?", (memo_id,)).fetchone()
    return _decode(row)


@router.delete("/{memo_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_memo(memo_id: int):
    with get_connection() as conn:
        cur = conn.execute("DELETE FROM memos WHERE id=?", (memo_id,))
        if cur.rowcount == 0:
            raise HTTPException(status_code=404, detail="memo not found")
    return Response(status_code=status.HTTP_204_NO_CONTENT)
