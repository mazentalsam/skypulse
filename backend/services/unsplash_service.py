import requests
from backend import config
from backend.services.demo_data import DEMO_UNSPLASH_PHOTOS

UNSPLASH_URL = 'https://api.unsplash.com/search/photos'


def get_location_photos(location, per_page=5):
    if config.DEMO_MODE:
        return list(DEMO_UNSPLASH_PHOTOS)

    if not config.UNSPLASH_ACCESS_KEY:
        return []

    try:
        params = {
            'query': f'{location} landmark',
            'per_page': per_page,
            'orientation': 'landscape',
        }
        headers = {'Authorization': f'Client-ID {config.UNSPLASH_ACCESS_KEY}'}
        resp = requests.get(UNSPLASH_URL, params=params, headers=headers, timeout=10)
        resp.raise_for_status()
        data = resp.json()

        return [
            {
                'id': photo['id'],
                'url': photo['urls']['regular'],
                'description': photo.get('alt_description', ''),
                'photographer': photo['user']['name'],
            }
            for photo in data.get('results', [])
        ]
    except requests.RequestException:
        return []
