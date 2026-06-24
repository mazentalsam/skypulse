from flask import Blueprint, request, jsonify, make_response
from backend.extensions import cache
from backend.services import ai_service
from backend.services.geocoding_service import geocode, LocationNotFoundError
from backend.services.weather_service import get_current_weather, get_forecast, WeatherAPIError

ai_bp = Blueprint('ai', __name__)


def _add_cache_header(response, hit=False):
    response.headers['X-Cache'] = 'HIT' if hit else 'MISS'
    return response


@ai_bp.route('/ai/briefing', methods=['POST'])
def ai_briefing():
    data = request.get_json()
    if not data or not data.get('weather_data'):
        return jsonify({'error': 'weather_data is required'}), 400

    location_name = data.get('location_name', '')
    cache_key = f'ai_briefing_{location_name}_{hash(str(data["weather_data"].get("weather", [{}])[0].get("id", "")))}'
    cached = cache.get(cache_key)
    if cached:
        resp = make_response(jsonify({'briefing': cached}))
        return _add_cache_header(resp, hit=True)

    language = data.get('language', 'en')
    briefing = ai_service.generate_weather_briefing(data['weather_data'], location_name, language)
    cache.set(cache_key, briefing, timeout=600)
    resp = make_response(jsonify({'briefing': briefing}))
    return _add_cache_header(resp, hit=False)


@ai_bp.route('/ai/trip-advice', methods=['POST'])
def ai_trip_advice():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'Request body is required'}), 400

    destination = data.get('destination', '')
    dates = data.get('dates', '')
    weather_data = data.get('weather_data', {})

    if not destination:
        return jsonify({'error': 'Destination is required'}), 400

    advice = ai_service.generate_trip_advice(destination, dates, weather_data)
    resp = make_response(jsonify(advice))
    return _add_cache_header(resp, hit=False)


@ai_bp.route('/ai/outfit', methods=['POST'])
def ai_outfit():
    data = request.get_json()
    if not data or not data.get('weather_data'):
        return jsonify({'error': 'weather_data is required'}), 400

    result = ai_service.generate_outfit_recommendation(data['weather_data'])
    resp = make_response(jsonify(result))
    return _add_cache_header(resp, hit=False)


@ai_bp.route('/ai/alerts', methods=['POST'])
def ai_alerts():
    data = request.get_json()
    if not data or not data.get('forecast_data'):
        return jsonify({'error': 'forecast_data is required'}), 400

    alerts = ai_service.generate_smart_alerts(data['forecast_data'])
    resp = make_response(jsonify({'alerts': alerts}))
    return _add_cache_header(resp, hit=False)


@ai_bp.route('/ai/mood', methods=['POST'])
def ai_mood():
    data = request.get_json()
    if not data or not data.get('weather_data'):
        return jsonify({'error': 'weather_data is required'}), 400

    mood = ai_service.generate_mood_score(data['weather_data'])
    resp = make_response(jsonify(mood))
    return _add_cache_header(resp, hit=False)


@ai_bp.route('/ai/natural-search', methods=['POST'])
def ai_natural_search():
    data = request.get_json()
    if not data or not data.get('query'):
        return jsonify({'error': 'query is required'}), 400

    query = data['query']

    parsed = ai_service.parse_natural_language_query(query)
    if not parsed or not parsed.get('location'):
        return jsonify({'error': 'Could not understand the query. Try including a city name.'}), 400

    try:
        location = geocode(parsed['location'])
        weather = get_current_weather(location['lat'], location['lon'])
        forecast = get_forecast(location['lat'], location['lon'])
    except (LocationNotFoundError, WeatherAPIError) as e:
        return jsonify({'error': str(e)}), 502

    combined = {
        'current': weather,
        'forecast_preview': forecast.get('list', [])[:8],
    }

    answer = ai_service.generate_natural_language_answer(query, combined, location.get('city', ''))

    resp = make_response(jsonify({
        'answer': answer,
        'location': location,
        'parsed_query': parsed,
    }))
    return _add_cache_header(resp, hit=False)


@ai_bp.route('/ai/plan-week', methods=['POST'])
def ai_plan_week():
    data = request.get_json()
    if not data or not data.get('schedule'):
        return jsonify({'error': 'schedule is required'}), 400

    forecast_data = data.get('forecast_data', {})
    location_name = data.get('location_name', '')
    result = ai_service.plan_my_week(data['schedule'], forecast_data, location_name)
    return jsonify({'plans': result})


@ai_bp.route('/ai/compare', methods=['POST'])
def ai_compare():
    data = request.get_json()
    if not data or not data.get('city1') or not data.get('city2'):
        return jsonify({'error': 'city1 and city2 data required'}), 400

    insight = ai_service.generate_comparison_insight(data['city1'], data['city2'])
    return jsonify({'insight': insight})
