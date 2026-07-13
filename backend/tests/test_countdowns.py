from datetime import UTC, datetime, timedelta


def test_create_list_update_delete_countdown(client):
    target = (datetime.now(UTC) + timedelta(days=2, hours=3, minutes=10)).replace(microsecond=0).isoformat()
    create = client.post(
        "/api/countdowns",
        json={"title": "期末考试", "target_at": target, "description": "高数"},
    )
    assert create.status_code == 201
    item = create.json()
    assert item["id"] > 0
    assert item["title"] == "期末考试"
    assert item["remaining"]["total_seconds"] > 0
    assert item["remaining"]["days"] >= 2
    assert item["is_expired"] is False

    listing = client.get("/api/countdowns")
    assert listing.status_code == 200
    assert listing.json()["total"] == 1

    new_target = (datetime.now(UTC) + timedelta(days=5)).replace(microsecond=0).isoformat()
    update = client.put(
        f"/api/countdowns/{item['id']}",
        json={"title": "英语考试", "target_at": new_target, "description": "四级"},
    )
    assert update.status_code == 200
    assert update.json()["title"] == "英语考试"

    delete = client.delete(f"/api/countdowns/{item['id']}")
    assert delete.status_code == 204
    assert client.get("/api/countdowns").json()["total"] == 0


def test_countdown_expired_and_not_found(client):
    target = (datetime.now(UTC) - timedelta(hours=1)).replace(microsecond=0).isoformat()
    create = client.post("/api/countdowns", json={"title": "已过期", "target_at": target})
    assert create.status_code == 201
    assert create.json()["is_expired"] is True
    assert create.json()["remaining"]["total_seconds"] == 0
    assert client.get("/api/countdowns/999").status_code == 404
