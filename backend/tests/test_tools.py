def test_random_number_pick_and_dice(client):
    number = client.post("/api/tools/random/number", json={"min": 5, "max": 5})
    assert number.status_code == 200
    assert number.json()["result"] == 5

    pick = client.post("/api/tools/random/pick", json={"items": ["A", "B", "C"], "count": 2})
    assert pick.status_code == 200
    assert len(pick.json()["items"]) == 2
    assert set(pick.json()["items"]).issubset({"A", "B", "C"})

    dice = client.post("/api/tools/random/dice", json={"sides": 6, "count": 3})
    assert dice.status_code == 200
    body = dice.json()
    assert len(body["rolls"]) == 3
    assert all(1 <= value <= 6 for value in body["rolls"])
    assert body["total"] == sum(body["rolls"])


def test_password_generator_respects_options(client):
    response = client.post(
        "/api/tools/password",
        json={
            "length": 16,
            "use_uppercase": True,
            "use_lowercase": True,
            "use_digits": True,
            "use_symbols": False,
        },
    )
    assert response.status_code == 200
    password = response.json()["password"]
    assert len(password) == 16
    assert any(ch.isupper() for ch in password)
    assert any(ch.islower() for ch in password)
    assert any(ch.isdigit() for ch in password)
    assert response.json()["length"] == 16


def test_unit_conversion_length_temperature_weight(client):
    length = client.post("/api/tools/convert", json={"category": "length", "from_unit": "m", "to_unit": "cm", "value": 1})
    assert length.status_code == 200
    assert length.json()["result"] == 100

    temp = client.post("/api/tools/convert", json={"category": "temperature", "from_unit": "c", "to_unit": "f", "value": 0})
    assert temp.status_code == 200
    assert temp.json()["result"] == 32

    weight = client.post("/api/tools/convert", json={"category": "weight", "from_unit": "kg", "to_unit": "g", "value": 2})
    assert weight.status_code == 200
    assert weight.json()["result"] == 2000


def test_tool_validation_errors(client):
    assert client.post("/api/tools/random/number", json={"min": 10, "max": 1}).status_code == 400
    assert client.post("/api/tools/random/pick", json={"items": [], "count": 1}).status_code == 422
    assert client.post("/api/tools/password", json={"length": 8, "use_uppercase": False, "use_lowercase": False, "use_digits": False, "use_symbols": False}).status_code == 400
    assert client.post("/api/tools/convert", json={"category": "length", "from_unit": "m", "to_unit": "unknown", "value": 1}).status_code == 400
