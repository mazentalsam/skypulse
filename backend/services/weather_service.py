import requests
from backend import config
from backend.services.demo_data import (
    DEMO_CURRENT_WEATHER, DEMO_FORECAST, DEMO_AIR_QUALITY, DEMO_UV_INDEX,
)

BASE_URL = 'https://api.openweathermap.org/data/2.5'
AQ_URL = 'https://api.openweathermap.org/data/2.5/air_pollution'


class WeatherAPIError(Exception):
    pass


def get_current_weather(lat, lon):
    if config.DEMO_MODE:
        return dict(DEMO_CURRENT_WEATHER)

    params = {
        'lat': lat, 'lon': lon,
        'appid': config.OPENWEATHERMAP_API_KEY,
        'units': 'metric',
    }
    try:
        resp = requests.get(f'{BASE_URL}/weather', params=params, timeout=10)
        resp.raise_for_status()
        return resp.json()
    except requests.RequestException as e:
        raise WeatherAPIError(f'Failed to fetch current weather: {str(e)}')


def get_forecast(lat, lon):
    if config.DEMO_MODE:
        return dict(DEMO_FORECAST)

    params = {
        'lat': lat, 'lon': lon,
        'appid': config.OPENWEATHERMAP_API_KEY,
        'units': 'metric',
    }
    try:
        resp = requests.get(f'{BASE_URL}/forecast', params=params, timeout=10)
        resp.raise_for_status()
        return resp.json()
    except requests.RequestException as e:
        raise WeatherAPIError(f'Failed to fetch forecast: {str(e)}')


def get_air_quality(lat, lon):
    if config.DEMO_MODE:
        return DEMO_AIR_QUALITY

    params = {
        'lat': lat, 'lon': lon,
        'appid': config.OPENWEATHERMAP_API_KEY,
    }
    try:
        resp = requests.get(AQ_URL, params=params, timeout=10)
        resp.raise_for_status()
        return resp.json()
    except requests.RequestException:
        return None


def get_uv_index(lat, lon):
    if config.DEMO_MODE:
        return DEMO_UV_INDEX

    try:
        params = {
            'lat': lat, 'lon': lon,
            'exclude': 'minutely,hourly,daily,alerts',
            'appid': config.OPENWEATHERMAP_API_KEY,
            'units': 'metric',
        }
        resp = requests.get(f'{BASE_URL.replace("/data/2.5", "/data/3.0")}/onecall', params=params, timeout=10)
        if resp.status_code == 200:
            data = resp.json()
            return data.get('current', {}).get('uvi', None)
    except requests.RequestException:
        pass
    return None


def check_alert_triggers(weather_data, alerts):
    triggered = []
    if not weather_data or not alerts:
        return triggered

    main = weather_data.get('main', {})
    wind = weather_data.get('wind', {})
    rain = weather_data.get('rain', {})

    for alert in alerts:
        condition = alert['condition']
        threshold = alert['threshold_value']
        threshold_type = alert['threshold_type']
        current_value = None

        if condition == 'temperature':
            current_value = main.get('temp')
        elif condition == 'humidity':
            current_value = main.get('humidity')
        elif condition == 'wind':
            current_value = wind.get('speed')
        elif condition == 'rain':
            current_value = rain.get('1h', 0)

        if current_value is not None:
            is_triggered = (
                (threshold_type == 'greater_than' and current_value > threshold)
                or (threshold_type == 'less_than' and current_value < threshold)
            )
            if is_triggered:
                triggered.append({
                    'alert_id': alert['id'],
                    'condition': condition,
                    'threshold_value': threshold,
                    'threshold_type': threshold_type,
                    'current_value': current_value,
                    'message': f'{condition.title()} is {current_value} ({threshold_type.replace("_", " ")} {threshold})',
                })

    return triggered
