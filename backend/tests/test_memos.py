def test_create_list_search_update_delete_memo(client):
    create = client.post(
        "/api/memos",
        json={"title": "高数作业", "content": "完成第三章习题", "tags": ["学习", "作业"]},
    )
    assert create.status_code == 201
    memo = create.json()
    assert memo["id"] > 0
    assert memo["title"] == "高数作业"
    assert memo["tags"] == ["学习", "作业"]
    assert memo["created_at"] <= memo["updated_at"]

    listing = client.get("/api/memos")
    assert listing.status_code == 200
    assert listing.json()["total"] == 1
    assert listing.json()["items"][0]["title"] == "高数作业"

    search = client.get("/api/memos", params={"q": "第三章"})
    assert search.status_code == 200
    assert search.json()["total"] == 1

    update = client.put(
        f"/api/memos/{memo['id']}",
        json={"title": "线代作业", "content": "矩阵习题", "tags": ["学习"]},
    )
    assert update.status_code == 200
    assert update.json()["title"] == "线代作业"

    delete = client.delete(f"/api/memos/{memo['id']}")
    assert delete.status_code == 204
    assert client.get("/api/memos").json()["total"] == 0


def test_memo_not_found(client):
    assert client.get("/api/memos/999").status_code == 404
    assert client.delete("/api/memos/999").status_code == 404
