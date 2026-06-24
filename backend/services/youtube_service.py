import requests
from datetime import datetime, timedelta, timezone
from backend import config, models
from backend.services.demo_data import DEMO_YOUTUBE_VIDEOS

YOUTUBE_SEARCH_URL = 'https://www.googleapis.com/youtube/v3/search'

MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']


def get_location_videos(location, max_results=6):
    if config.DEMO_MODE:
        return {'source': 'demo', 'videos': list(DEMO_YOUTUBE_VIDEOS)}

    cached = models.get_cached_videos(location)
    if cached:
        return {'source': 'youtube_cached', 'videos': cached}

    if not config.YOUTUBE_API_KEY:
        return None

    now = datetime.now(timezone.utc)
    month_name = MONTHS[now.month - 1]
    after_date = (now - timedelta(days=180)).strftime('%Y-%m-%dT00:00:00Z')

    try:
        params = {
            'part': 'snippet',
            'q': f'{location} weather {month_name} {now.year} travel guide',
            'type': 'video',
            'maxResults': max_results,
            'order': 'relevance',
            'publishedAfter': after_date,
            'key': config.YOUTUBE_API_KEY,
        }
        resp = requests.get(YOUTUBE_SEARCH_URL, params=params, timeout=10)

        if resp.status_code == 403:
            return None

        resp.raise_for_status()
        data = resp.json()

        videos = []
        for item in data.get('items', []):
            snippet = item.get('snippet', {})
            videos.append({
                'video_id': item.get('id', {}).get('videoId', ''),
                'title': snippet.get('title', ''),
                'thumbnail': snippet.get('thumbnails', {}).get('high', {}).get('url', ''),
                'channel': snippet.get('channelTitle', ''),
            })

        models.cache_videos(location, videos)
        return {'source': 'youtube', 'videos': videos}

    except requests.RequestException:
        return None
