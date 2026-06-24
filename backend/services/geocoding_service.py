import re
import requests
from backend import config
from backend.services.demo_data import DEMO_GEOCODE

NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search'


class LocationNotFoundError(Exception):
    pass


def geocode(query):
    if config.DEMO_MODE:
        demo = dict(DEMO_GEOCODE)
        demo['display_name'] = f'{query} (Demo Mode)'
        demo['city'] = query.strip().title()
        return demo

    query = query.strip()

    coord_match = re.match(r'^(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)$', query)
    if coord_match:
        return {
            'lat': float(coord_match.group(1)),
            'lon': float(coord_match.group(2)),
            'display_name': f'{coord_match.group(1)}, {coord_match.group(2)}',
            'city': f'{coord_match.group(1)}, {coord_match.group(2)}',
            'country': '',
        }

    headers = {'User-Agent': f'SkyPulse/1.0 ({config.CONTACT_EMAIL})'}
    params = {
        'q': query,
        'format': 'json',
        'limit': 1,
        'addressdetails': 1,
    }

    try:
        resp = requests.get(NOMINATIM_URL, params=params, headers=headers, timeout=10)
        resp.raise_for_status()
        results = resp.json()
    except requests.RequestException as e:
        raise LocationNotFoundError(f'Geocoding service error: {str(e)}')

    if not results:
        raise LocationNotFoundError(f'Location not found: {query}')

    result = results[0]
    address = result.get('address', {})
    city = (
        address.get('city')
        or address.get('town')
        or address.get('village')
        or address.get('municipality')
        or result.get('display_name', '').split(',')[0]
    )

    return {
        'lat': float(result['lat']),
        'lon': float(result['lon']),
        'display_name': result.get('display_name', ''),
        'city': city,
        'country': address.get('country_code', '').upper(),
    }
