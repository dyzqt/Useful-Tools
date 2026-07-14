import httpx
from fastapi import APIRouter, HTTPException, Query

router = APIRouter(prefix="/api", tags=["weather"])


class CityNotFound(Exception):
    pass


_WEATHER_DESCRIPTIONS = {
    0: "晴朗",
    1: "主要晴朗",
    2: "局部多云",
    3: "阴天",
    45: "雾",
    48: "雾凇",
    51: "小毛毛雨",
    53: "中等毛毛雨",
    55: "大毛毛雨",
    61: "小雨",
    63: "中雨",
    65: "大雨",
    71: "小雪",
    73: "中雪",
    75: "大雪",
    80: "小阵雨",
    81: "中等阵雨",
    82: "强阵雨",
    95: "雷暴",
    96: "雷暴伴轻微冰雹",
    99: "雷暴伴强冰雹",
}


def weather_description(code: int) -> str:
    return _WEATHER_DESCRIPTIONS.get(code, "未知天气")


def _geocode(city: str) -> dict:
    response = httpx.get(
        "https://geocoding-api.open-meteo.com/v1/search",
        params={"name": city, "count": 1, "language": "zh", "format": "json"},
        timeout=10,
    )
    response.raise_for_status()
    data = response.json()
    results = data.get("results") or []
    if not results:
        raise CityNotFound(city)
    return results[0]


def get_weather(city: str, days: int = 3) -> dict:
    place = _geocode(city)
    latitude = place["latitude"]
    longitude = place["longitude"]
    response = httpx.get(
        "https://api.open-meteo.com/v1/forecast",
        params={
            "latitude": latitude,
            "longitude": longitude,
            "current": "temperature_2m,wind_speed_10m,weather_code",
            "daily": "weather_code,temperature_2m_max,temperature_2m_min",
            "forecast_days": days,
            "timezone": "auto",
        },
        timeout=10,
    )
    response.raise_for_status()
    data = response.json()
    current = data.get("current", {})
    daily = data.get("daily", {})
    current_code = int(current.get("weather_code", -1))
    forecast = []
    for date, code, tmax, tmin in zip(
        daily.get("time", [])[:days],
        daily.get("weather_code", [])[:days],
        daily.get("temperature_2m_max", [])[:days],
        daily.get("temperature_2m_min", [])[:days],
    ):
        code = int(code)
        forecast.append(
            {
                "date": date,
                "temperature_min": tmin,
                "temperature_max": tmax,
                "weather_code": code,
                "description": weather_description(code),
            }
        )
    return {
        "city": place.get("name", city),
        "country": place.get("country"),
        "latitude": latitude,
        "longitude": longitude,
        "current": {
            "temperature": current.get("temperature_2m"),
            "wind_speed": current.get("wind_speed_10m"),
            "weather_code": current_code,
            "description": weather_description(current_code),
        },
        "forecast_days": days,
        "forecast": forecast,
    }


@router.get("/weather")
def weather(
    city: str = Query(min_length=1, max_length=80),
    days: int = Query(default=3),
):
    if days not in {3, 7, 15}:
        raise HTTPException(status_code=422, detail="days must be 3, 7, or 15")
    try:
        return get_weather(city, days)
    except CityNotFound:
        raise HTTPException(status_code=404, detail="城市未找到")
    except httpx.HTTPError as exc:
        raise HTTPException(status_code=502, detail=f"weather service error: {exc}")
