from fastapi import APIRouter, HTTPException, status
import httpx
from dotenv import load_dotenv
import os
from datetime import datetime
from app.schemas import DistrictForecast, WeatherData

load_dotenv()

router = APIRouter(prefix="/weather", tags=["Weather"])

WEATHER_API_KEY = os.getenv("WEATHER_API_KEY", "your-weather-api-key-here")
WEATHER_API_URL = os.getenv(
    "WEATHER_API_URL", "https://api.openweathermap.org/data/2.5/weather"
)

OPEN_METEO_API_URL = "https://api.open-meteo.com/v1/forecast"

SRI_LANKA_DISTRICT_COORDS = {
    "Ampara": {"lat": 7.2975, "lon": 81.6820},
    "Anuradhapura": {"lat": 8.3114, "lon": 80.4037},
    "Badulla": {"lat": 6.9934, "lon": 81.0550},
    "Batticaloa": {"lat": 7.7102, "lon": 81.6924},
    "Colombo": {"lat": 6.9271, "lon": 79.8612},
    "Galle": {"lat": 6.0535, "lon": 80.2210},
    "Gampaha": {"lat": 7.0840, "lon": 79.9990},
    "Hambantota": {"lat": 6.1241, "lon": 81.1185},
    "Jaffna": {"lat": 9.6615, "lon": 80.0255},
    "Kalutara": {"lat": 6.5854, "lon": 79.9607},
    "Kandy": {"lat": 7.2906, "lon": 80.6337},
    "Kegalle": {"lat": 7.2513, "lon": 80.3464},
    "Kilinochchi": {"lat": 9.3803, "lon": 80.4042},
    "Kurunegala": {"lat": 7.4863, "lon": 80.3623},
    "Mannar": {"lat": 8.9810, "lon": 79.9042},
    "Matale": {"lat": 7.4675, "lon": 80.6234},
    "Matara": {"lat": 5.9549, "lon": 80.5550},
    "Monaragala": {"lat": 6.8728, "lon": 81.3507},
    "Mullaitivu": {"lat": 9.2670, "lon": 80.8140},
    "Nuwara Eliya": {"lat": 6.9497, "lon": 80.7891},
    "Polonnaruwa": {"lat": 7.9403, "lon": 81.0188},
    "Puttalam": {"lat": 8.0362, "lon": 79.8283},
    "Ratnapura": {"lat": 6.6828, "lon": 80.3992},
    "Trincomalee": {"lat": 8.5874, "lon": 81.2152},
    "Vavuniya": {"lat": 8.7514, "lon": 80.4971},
}


def _weather_code_to_condition(code: int) -> str:
    code_map = {
        0: "Clear Sky",
        1: "Mainly Clear",
        2: "Partly Cloudy",
        3: "Overcast",
        45: "Fog",
        48: "Depositing Rime Fog",
        51: "Light Drizzle",
        53: "Moderate Drizzle",
        55: "Dense Drizzle",
        56: "Light Freezing Drizzle",
        57: "Dense Freezing Drizzle",
        61: "Slight Rain",
        63: "Moderate Rain",
        65: "Heavy Rain",
        66: "Light Freezing Rain",
        67: "Heavy Freezing Rain",
        71: "Slight Snow",
        73: "Moderate Snow",
        75: "Heavy Snow",
        77: "Snow Grains",
        80: "Slight Rain Showers",
        81: "Moderate Rain Showers",
        82: "Violent Rain Showers",
        85: "Slight Snow Showers",
        86: "Heavy Snow Showers",
        95: "Thunderstorm",
        96: "Thunderstorm with Slight Hail",
        99: "Thunderstorm with Heavy Hail",
    }
    return code_map.get(code, "Unknown")


@router.get("/{city}", response_model=WeatherData)
async def get_weather(city: str):
    """Get weather information for a specific city

    Note: To use this endpoint, you need to:
    1. Sign up at https://openweathermap.org/api
    2. Get your API key
    3. Add it to the .env file as WEATHER_API_KEY
    """

    if WEATHER_API_KEY == "your-weather-api-key-here":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Weather API key not configured. Please add your OpenWeatherMap API key to .env file",
        )

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(
                WEATHER_API_URL,
                params={"q": city, "appid": WEATHER_API_KEY, "units": "metric"},
            )

            if response.status_code == 404:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"City '{city}' not found",
                )

            if response.status_code != 200:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to fetch weather data from external API",
                )

            data = response.json()

            # Extract relevant weather information
            weather_data = WeatherData(
                city=data["name"],
                temperature=data["main"]["temp"],
                feels_like=data["main"]["feels_like"],
                humidity=data["main"]["humidity"],
                pressure=data["main"]["pressure"],
                weather_main=data["weather"][0]["main"],
                weather_description=data["weather"][0]["description"],
                wind_speed=data["wind"]["speed"],
            )

            return weather_data

    except httpx.RequestError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error connecting to weather service: {str(e)}",
        )
    except KeyError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unexpected response format from weather API",
        )


@router.get("/forecast/district", response_model=DistrictForecast)
async def get_district_forecast(district: str, date: str):
    """Get real weather forecast for a Sri Lankan district and date using Open-Meteo."""

    normalized_district = district.strip()
    if normalized_district not in SRI_LANKA_DISTRICT_COORDS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported district. Please select a valid Sri Lankan district.",
        )

    try:
        selected_date = datetime.strptime(date, "%Y-%m-%d").date()
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid date format. Use YYYY-MM-DD.",
        )

    coords = SRI_LANKA_DISTRICT_COORDS[normalized_district]

    try:
        async with httpx.AsyncClient(timeout=12.0) as client:
            response = await client.get(
                OPEN_METEO_API_URL,
                params={
                    "latitude": coords["lat"],
                    "longitude": coords["lon"],
                    "hourly": "temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code",
                    "timezone": "Asia/Colombo",
                    "start_date": selected_date.isoformat(),
                    "end_date": selected_date.isoformat(),
                },
            )

            if response.status_code != 200:
                raise HTTPException(
                    status_code=status.HTTP_502_BAD_GATEWAY,
                    detail="Failed to fetch forecast from Open-Meteo.",
                )

            data = response.json()
            hourly = data.get("hourly", {})
            times = hourly.get("time", [])
            temperatures = hourly.get("temperature_2m", [])
            humidities = hourly.get("relative_humidity_2m", [])
            winds = hourly.get("wind_speed_10m", [])
            codes = hourly.get("weather_code", [])

            if not times:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="No forecast available for selected date and district.",
                )

            # Prefer midday reading (12:00) for a representative daily snapshot.
            target_time = f"{selected_date.isoformat()}T12:00"
            index = 0
            if target_time in times:
                index = times.index(target_time)

            code = int(codes[index]) if index < len(codes) else 0

            return DistrictForecast(
                district=normalized_district,
                date=selected_date.isoformat(),
                condition=_weather_code_to_condition(code),
                temperature=(
                    float(temperatures[index]) if index < len(temperatures) else 0.0
                ),
                humidity=int(humidities[index]) if index < len(humidities) else 0,
                wind_speed=float(winds[index]) if index < len(winds) else 0.0,
            )

    except httpx.RequestError as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error connecting to forecast provider: {str(exc)}",
        )
