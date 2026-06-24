from flask import Blueprint, request, jsonify, make_response
from backend.extensions import cache
from backend.services.geocoding_service import geocode, LocationNotFoundError
from backend.services.weather_service import (
    get_current_weather, get_forecast, get_air_quality, get_uv_index,
    check_alert_triggers, WeatherAPIError,
)
from backend.services.historical_service import get_historical_average
from backend import models
from backend.utils.validators import validate_search_query

weather_bp = Blueprint('weather', __name__)


def _add_cache_header(response, hit=False):
    response.headers['X-Cache'] = 'HIT' if hit else 'MISS'
    return response


@weather_bp.route('/weather/current', methods=['GET'])
def current_weather():
    """Get current weather, air quality, and UV for a location.
    ---
    tags:
      - Weather
    parameters:
      - name: q
        in: query
        type: string
        required: true
        description: City name or "lat,lon" coordinates
    responses:
      200:
        description: Current weather data with location, air quality, UV index, and triggered alerts
      400:
        description: Invalid query
      404:
        description: Location not found
      502:
        description: Upstream weather API error
    """
    query = request.args.get('q', '').strip()
    valid, msg = validate_search_query(query)
    if not valid:
        return jsonify({'error': msg}), 400

    cache_key = f'weather_current_{query.lower()}'
    cached = cache.get(cache_key)
    if cached:
        resp = make_response(jsonify(cached))
        return _add_cache_header(resp, hit=True)

    try:
        location = geocode(query)
    except LocationNotFoundError as e:
        return jsonify({'error': str(e)}), 404

    try:
        weather = get_current_weather(location['lat'], location['lon'])
        air_quality = get_air_quality(location['lat'], location['lon'])
        uv_index = get_uv_index(location['lat'], location['lon'])
    except WeatherAPIError as e:
        return jsonify({'error': str(e)}), 502

    alerts = models.get_alerts_for_location(location['lat'], location['lon'])
    triggered_alerts = check_alert_triggers(weather, alerts)

    for ta in triggered_alerts:
        models.update_alert_triggered(ta['alert_id'], True)

    result = {
        'location': location,
        'weather': weather,
        'air_quality': air_quality,
        'uv_index': uv_index,
        'triggered_alerts': triggered_alerts,
    }

    cache.set(cache_key, result, timeout=600)
    resp = make_response(jsonify(result))
    return _add_cache_header(resp, hit=False)


@weather_bp.route('/weather/forecast', methods=['GET'])
def forecast():
    """Get 5-day / 3-hour forecast for coordinates.
    ---
    tags:
      - Weather
    parameters:
      - name: lat
        in: query
        type: number
        required: true
      - name: lon
        in: query
        type: number
        required: true
    responses:
      200:
        description: Forecast data
      400:
        description: Missing coordinates
      502:
        description: Upstream API error
    """
    lat = request.args.get('lat')
    lon = request.args.get('lon')
    if not lat or not lon:
        return jsonify({'error': 'lat and lon parameters are required'}), 400

    cache_key = f'weather_forecast_{lat}_{lon}'
    cached = cache.get(cache_key)
    if cached:
        resp = make_response(jsonify(cached))
        return _add_cache_header(resp, hit=True)

    try:
        data = get_forecast(float(lat), float(lon))
    except WeatherAPIError as e:
        return jsonify({'error': str(e)}), 502

    cache.set(cache_key, data, timeout=600)
    resp = make_response(jsonify(data))
    return _add_cache_header(resp, hit=False)


@weather_bp.route('/weather/hourly', methods=['GET'])
def hourly():
    lat = request.args.get('lat')
    lon = request.args.get('lon')
    if not lat or not lon:
        return jsonify({'error': 'lat and lon parameters are required'}), 400

    cache_key = f'weather_hourly_{lat}_{lon}'
    cached = cache.get(cache_key)
    if cached:
        resp = make_response(jsonify(cached))
        return _add_cache_header(resp, hit=True)

    try:
        forecast_data = get_forecast(float(lat), float(lon))
    except WeatherAPIError as e:
        return jsonify({'error': str(e)}), 502

    hourly_items = forecast_data.get('list', [])[:8]
    cache.set(cache_key, hourly_items, timeout=600)
    resp = make_response(jsonify(hourly_items))
    return _add_cache_header(resp, hit=False)


@weather_bp.route('/weather/historical', methods=['GET'])
def historical():
    lat = request.args.get('lat')
    lon = request.args.get('lon')
    if not lat or not lon:
        return jsonify({'error': 'lat and lon parameters are required'}), 400

    cache_key = f'weather_historical_{lat}_{lon}'
    cached = cache.get(cache_key)
    if cached:
        resp = make_response(jsonify(cached))
        return _add_cache_header(resp, hit=True)

    data = get_historical_average(float(lat), float(lon))
    if data is None:
        return jsonify({'error': 'Historical data not available'}), 404

    cache.set(cache_key, data, timeout=3600)
    resp = make_response(jsonify(data))
    return _add_cache_header(resp, hit=False)


@weather_bp.route('/weather/compare', methods=['GET'])
def compare():
    """Compare current weather between two cities.
    ---
    tags:
      - Weather
    parameters:
      - name: city1
        in: query
        type: string
        required: true
      - name: city2
        in: query
        type: string
        required: true
    responses:
      200:
        description: Side-by-side weather comparison
    """
    city1 = request.args.get('city1', '').strip()
    city2 = request.args.get('city2', '').strip()
    if not city1 or not city2:
        return jsonify({'error': 'city1 and city2 parameters are required'}), 400

    results = {}
    for label, query in [('city1', city1), ('city2', city2)]:
        try:
            loc = geocode(query)
        except LocationNotFoundError as e:
            return jsonify({'error': f'{query}: {str(e)}'}), 404
        try:
            weather = get_current_weather(loc['lat'], loc['lon'])
            forecast_data = get_forecast(loc['lat'], loc['lon'])
            air_quality = get_air_quality(loc['lat'], loc['lon'])
        except WeatherAPIError as e:
            return jsonify({'error': f'{query}: {str(e)}'}), 502
        results[label] = {
            'location': loc,
            'weather': weather,
            'air_quality': air_quality,
            'forecast': forecast_data,
        }

    resp = make_response(jsonify(results))
    return _add_cache_header(resp, hit=False)


@weather_bp.route('/weather/diff/<int:search_id>', methods=['GET'])
def weather_diff(search_id):
    saved = models.get_search_by_id(search_id)
    if not saved:
        return jsonify({'error': 'Saved search not found'}), 404

    try:
        loc = geocode(saved['city'])
        current = get_current_weather(loc['lat'], loc['lon'])
    except (LocationNotFoundError, WeatherAPIError) as e:
        return jsonify({'error': str(e)}), 502

    old_data = saved.get('weather_data', {})
    old_main = old_data.get('main', {}) if isinstance(old_data, dict) else {}
    new_main = current.get('main', {})

    changes = []
    for key, label, unit in [('temp', 'Temperature', '°C'), ('humidity', 'Humidity', '%'), ('pressure', 'Pressure', ' hPa')]:
        old_val = old_main.get(key)
        new_val = new_main.get(key)
        if old_val is not None and new_val is not None:
            diff = round(new_val - old_val, 1)
            if abs(diff) > 0.5:
                changes.append({
                    'metric': label, 'old': old_val, 'new': new_val,
                    'diff': diff, 'unit': unit,
                    'direction': 'up' if diff > 0 else 'down',
                })

    old_wind = old_data.get('wind', {}).get('speed') if isinstance(old_data, dict) else None
    new_wind = current.get('wind', {}).get('speed')
    if old_wind is not None and new_wind is not None:
        diff = round(new_wind - old_wind, 1)
        if abs(diff) > 0.5:
            changes.append({
                'metric': 'Wind', 'old': old_wind, 'new': new_wind,
                'diff': diff, 'unit': ' m/s', 'direction': 'up' if diff > 0 else 'down',
            })

    return jsonify({
        'city': saved['city'],
        'saved_at': saved['created_at'],
        'changes': changes,
        'current_weather': current,
    })
