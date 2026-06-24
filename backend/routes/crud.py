from flask import Blueprint, request, jsonify
from backend import models
from backend.utils.validators import validate_search_query, validate_date_range

crud_bp = Blueprint('crud', __name__)


@crud_bp.route('/searches', methods=['POST'])
def create_search():
    """Save a weather search with full weather data.
    ---
    tags:
      - Searches
    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          required: [city, latitude, longitude, search_query, weather_data]
          properties:
            city: {type: string}
            country: {type: string}
            latitude: {type: number}
            longitude: {type: number}
            search_query: {type: string}
            weather_data: {type: object}
            notes: {type: string}
            tags: {type: string}
    responses:
      201:
        description: Created search record
      400:
        description: Validation error
    """
    data = request.get_json()
    if not data:
        return jsonify({'error': 'Request body is required'}), 400

    valid, msg = validate_search_query(data.get('search_query', ''))
    if not valid:
        return jsonify({'error': msg}), 400

    if not data.get('city'):
        return jsonify({'error': 'City is required'}), 400
    if data.get('latitude') is None or data.get('longitude') is None:
        return jsonify({'error': 'Coordinates are required'}), 400
    if not data.get('weather_data'):
        return jsonify({'error': 'Weather data is required'}), 400

    valid, err, _ = validate_date_range(data.get('date_from'), data.get('date_to'))
    if not valid:
        return jsonify({'error': err}), 400

    # Check for recent duplicate (same city in last 5 minutes)
    from datetime import datetime, timedelta, timezone
    existing = models.get_all_searches()
    city_lower = data.get('city', '').lower()
    for s in existing[:10]:
        if s['city'].lower() == city_lower:
            try:
                saved_at = datetime.fromisoformat(s['created_at']).replace(tzinfo=timezone.utc)
                if datetime.now(timezone.utc) - saved_at < timedelta(minutes=5):
                    return jsonify(s), 200
            except (ValueError, TypeError):
                pass

    result = models.create_search(data)
    return jsonify(result), 201


@crud_bp.route('/searches', methods=['GET'])
def get_searches():
    """List saved weather searches with optional pagination.
    ---
    tags:
      - Searches
    parameters:
      - name: page
        in: query
        type: integer
        required: false
        description: Page number (1-indexed). Omit for all results.
      - name: per_page
        in: query
        type: integer
        required: false
        description: Results per page (default 20, max 100)
    responses:
      200:
        description: Array of saved search records (with X-Total-Count header when paginated)
    """
    page = request.args.get('page', type=int)
    per_page = request.args.get('per_page', default=20, type=int)
    per_page = min(max(per_page, 1), 100)

    if page is not None:
        result = models.get_searches_paginated(page, per_page)
        resp = jsonify(result['items'])
        resp.headers['X-Total-Count'] = str(result['total'])
        resp.headers['X-Page'] = str(result['page'])
        resp.headers['X-Per-Page'] = str(result['per_page'])
        resp.headers['X-Total-Pages'] = str(result['total_pages'])
        return resp

    searches = models.get_all_searches()
    return jsonify(searches)


@crud_bp.route('/searches/<int:search_id>', methods=['GET'])
def get_search(search_id):
    """Get a single saved search by ID.
    ---
    tags:
      - Searches
    parameters:
      - name: search_id
        in: path
        type: integer
        required: true
    responses:
      200:
        description: Search record
      404:
        description: Not found
    """
    search = models.get_search_by_id(search_id)
    if search is None:
        return jsonify({'error': 'Search not found'}), 404
    return jsonify(search)


@crud_bp.route('/searches/<int:search_id>', methods=['PUT'])
def update_search(search_id):
    """Update notes, tags, or mood on a saved search.
    ---
    tags:
      - Searches
    parameters:
      - name: search_id
        in: path
        type: integer
        required: true
      - in: body
        name: body
        schema:
          type: object
          properties:
            notes: {type: string}
            tags: {type: string}
            mood_score: {type: integer}
    responses:
      200:
        description: Updated record
      404:
        description: Not found
    """
    existing = models.get_search_by_id(search_id)
    if existing is None:
        return jsonify({'error': 'Search not found'}), 404

    data = request.get_json()
    if not data:
        return jsonify({'error': 'Request body is required'}), 400

    result = models.update_search(search_id, data)
    return jsonify(result)


@crud_bp.route('/searches/<int:search_id>', methods=['DELETE'])
def delete_search(search_id):
    """Delete a saved search.
    ---
    tags:
      - Searches
    parameters:
      - name: search_id
        in: path
        type: integer
        required: true
    responses:
      200:
        description: Deleted
      404:
        description: Not found
    """
    existing = models.get_search_by_id(search_id)
    if existing is None:
        return jsonify({'error': 'Search not found'}), 404

    models.delete_search(search_id)
    return jsonify({'message': 'Deleted successfully'}), 200


@crud_bp.route('/searches/date-range', methods=['POST'])
def create_date_range_search():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'Request body is required'}), 400

    location_query = data.get('location', '').strip()
    date_from = data.get('date_from')
    date_to = data.get('date_to')

    if not location_query:
        return jsonify({'error': 'Location is required'}), 400

    from backend.utils.validators import validate_date_range, validate_search_query
    valid, msg = validate_search_query(location_query)
    if not valid:
        return jsonify({'error': msg}), 400

    valid, err, _ = validate_date_range(date_from, date_to)
    if not valid:
        return jsonify({'error': err}), 400

    if not date_from or not date_to:
        return jsonify({'error': 'Both date_from and date_to are required'}), 400

    # Check for duplicate
    existing = models.get_all_searches()
    for s in existing:
        if s['city'].lower() == location_query.lower() and s.get('date_from') == date_from and s.get('date_to') == date_to:
            return jsonify({'error': f'Search for {s["city"]} with this date range already exists.'}), 409

    from backend.services.geocoding_service import geocode, LocationNotFoundError
    from backend.services.weather_service import get_current_weather, get_forecast, WeatherAPIError

    try:
        location = geocode(location_query)
    except LocationNotFoundError as e:
        return jsonify({'error': str(e)}), 404

    try:
        weather = get_current_weather(location['lat'], location['lon'])
        forecast = get_forecast(location['lat'], location['lon'])
    except WeatherAPIError as e:
        return jsonify({'error': str(e)}), 502

    search_data = {
        'city': location['city'],
        'country': location.get('country', ''),
        'latitude': location['lat'],
        'longitude': location['lon'],
        'search_query': location_query,
        'date_from': date_from,
        'date_to': date_to,
        'weather_data': weather,
        'forecast_data': forecast,
        'notes': f'Date range search: {date_from} to {date_to}',
        'tags': 'date-range',
    }

    result = models.create_search(search_data)
    return jsonify(result), 201


@crud_bp.route('/dashboard/stats', methods=['GET'])
def dashboard_stats():
    """Get personal dashboard statistics.
    ---
    tags:
      - Dashboard
    responses:
      200:
        description: Stats including total searches, top city, avg mood, temperature ranges, and tag counts
    """
    stats = models.get_dashboard_stats()
    return jsonify(stats)
