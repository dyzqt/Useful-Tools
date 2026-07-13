def test_weather_endpoint_returns_current_and_three_day_forecast(client, monkeypatch):
    from app.routers import weather

    def fake_get_weather(city: str):
        assert city == "Beijing"
        return {
            "city": "Beijing",
            "country": "China",
            "latitude": 39.9,
            "longitude": 116.4,
            "current": {"temperature": 25.0, "wind_speed": 8.0, "weather_code": 1, "description": "主要晴朗"},
            "forecast": [
                {"date": "2026-07-13", "temperature_min": 21.0, "temperature_max": 29.0, "weather_code": 1, "description": "主要晴朗"},
                {"date": "2026-07-14", "temperature_min": 22.0, "temperature_max": 30.0, "weather_code": 2, "description": "局部多云"},
                {"date": "2026-07-15", "temperature_min": 20.0, "temperature_max": 28.0, "weather_code": 3, "description": "阴天"},
            ],
        }

    monkeypatch.setattr(weather, "get_weather", fake_get_weather)
    response = client.get("/api/weather", params={"city": "Beijing"})

    assert response.status_code == 200
    body = response.json()
    assert body["city"] == "Beijing"
    assert body["current"]["description"] == "主要晴朗"
    assert len(body["forecast"]) == 3


def test_weather_city_not_found(client, monkeypatch):
    from app.routers import weather

    def fake_get_weather(city: str):
        raise weather.CityNotFound("city not found")

    monkeypatch.setattr(weather, "get_weather", fake_get_weather)
    response = client.get("/api/weather", params={"city": "不存在城市"})

    assert response.status_code == 404
