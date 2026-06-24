from flask import Blueprint, request, jsonify, make_response
from backend.extensions import cache
from backend.services.youtube_service import get_location_videos
from backend.services.unsplash_service import get_location_photos

youtube_bp = Blueprint('youtube', __name__)


@youtube_bp.route('/youtube/videos', methods=['GET'])
def videos():
    """Get travel videos and photos for a location.
    ---
    tags:
      - Media
    parameters:
      - name: location
        in: query
        type: string
        required: true
        description: City or place name
    responses:
      200:
        description: Videos and/or photos for the location
      400:
        description: Missing location parameter
    """
    location = request.args.get('location', '').strip()
    if not location:
        return jsonify({'error': 'location parameter is required'}), 400

    cache_key = f'media_{location.lower()}'
    cached = cache.get(cache_key)
    if cached:
        resp = make_response(jsonify(cached))
        resp.headers['X-Cache'] = 'HIT'
        return resp

    result = get_location_videos(location)

    if result is None:
        photos = get_location_photos(location)
        result = {
            'source': 'unsplash_fallback',
            'videos': [],
            'photos': photos,
            'fallback_message': 'Showing photos — video quota reached',
        }

    cache.set(cache_key, result, timeout=3600)
    resp = make_response(jsonify(result))
    resp.headers['X-Cache'] = 'MISS'
    return resp
