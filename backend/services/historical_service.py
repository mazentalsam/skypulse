import requests
from datetime import datetime, timedelta, timezone
from backend import config
from backend.services.demo_data import DEMO_HISTORICAL

OPEN_METEO_URL = 'https://archive-api.open-meteo.com/v1/archive'


def get_historical_average(lat, lon):
    if config.DEMO_MODE:
        return dict(DEMO_HISTORICAL)

    today = datetime.now(timezone.utc)
    results = []

    for years_back in range(1, 6):
        target = today.replace(year=today.year - years_back)
        start = (target - timedelta(days=2)).strftime('%Y-%m-%d')
        end = (target + timedelta(days=2)).strftime('%Y-%m-%d')

        try:
            params = {
                'latitude': lat,
                'longitude': lon,
                'start_date': start,
                'end_date': end,
                'daily': 'temperature_2m_mean,relative_humidity_2m_mean,precipitation_sum',
                'timezone': 'auto',
            }
            resp = requests.get(OPEN_METEO_URL, params=params, timeout=10)
            if resp.status_code == 200:
                data = resp.json()
                daily = data.get('daily', {})
                temps = [t for t in (daily.get('temperature_2m_mean') or []) if t is not None]
                humids = [h for h in (daily.get('relative_humidity_2m_mean') or []) if h is not None]
                precips = [p for p in (daily.get('precipitation_sum') or []) if p is not None]
                if temps:
                    results.append({
                        'temp': sum(temps) / len(temps),
                        'humidity': sum(humids) / len(humids) if humids else None,
                        'precipitation': sum(precips) / len(precips) if precips else None,
                    })
        except requests.RequestException:
            continue

    if not results:
        return None

    avg_temp = sum(r['temp'] for r in results) / len(results)
    humids = [r['humidity'] for r in results if r['humidity'] is not None]
    precips = [r['precipitation'] for r in results if r['precipitation'] is not None]

    return {
        'avg_temp': round(avg_temp, 1),
        'avg_humidity': round(sum(humids) / len(humids), 0) if humids else None,
        'avg_precipitation': round(sum(precips) / len(precips), 1) if precips else None,
    }
