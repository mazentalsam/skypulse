import json
import re
import logging
from backend import config
from backend.services.demo_data import (
    DEMO_AI_BRIEFING, DEMO_TRIP_ADVICE, DEMO_OUTFIT,
    DEMO_SMART_ALERTS, DEMO_MOOD, DEMO_NL_ANSWER,
)

logger = logging.getLogger(__name__)

_client = None

MAX_INPUT_LENGTH = 500
INJECTION_PATTERNS = re.compile(
    r'ignore\s+(all\s+)?(previous|prior|above)\s+(instructions|prompts)|'
    r'(system|admin)\s*prompt|'
    r'reveal\s+(your|the)\s+(system|instructions|prompt)|'
    r'you\s+are\s+now\s+a|'
    r'act\s+as\s+(if|though)',
    re.IGNORECASE,
)


def _sanitize(text, max_length=MAX_INPUT_LENGTH):
    if not isinstance(text, str):
        return ''
    text = re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]', '', text)
    text = text.strip()[:max_length]
    return text


def _check_injection(text):
    return bool(INJECTION_PATTERNS.search(text))


def _get_client():
    global _client
    if _client is None:
        import anthropic
        _client = anthropic.Anthropic(api_key=config.ANTHROPIC_API_KEY)
    return _client


MODEL = 'claude-sonnet-4-6'


def _parse_json(text):
    text = text.strip()
    if text.startswith('```'):
        text = text.split('\n', 1)[-1] if '\n' in text else text[3:]
        if text.endswith('```'):
            text = text[:-3]
        text = text.strip()
    return json.loads(text)


def generate_weather_briefing(weather_data, location_name='', language='en'):
    if config.DEMO_MODE:
        if language != 'en':
            lang_demos = {
                'es': 'París disfruta de agradables 22°C con nubes dispersas — perfecto para una tarde junto al Sena. El viento es suave a 4,6 m/s del suroeste. Las probabilidades de lluvia aumentan a mitad de semana. El índice UV se sitúa en un moderado 5.',
                'fr': 'Paris profite d\'agréables 22°C avec des nuages épars — parfait pour un après-midi le long de la Seine. Le vent est doux à 4,6 m/s du sud-ouest. Les chances de pluie augmentent en milieu de semaine. L\'indice UV est modéré à 5.',
                'ja': 'パリは22°Cの快適な気温で雲がまばらに広がっています。セーヌ川沿いの午後に最適です。風は南西から4.6m/sと穏やかです。週半ばに雨の確率が上がります。UV指数は5で中程度です。',
                'de': 'Paris genießt angenehme 22°C mit vereinzelten Wolken — perfekt für einen Nachmittag an der Seine. Der Wind ist mild bei 4,6 m/s aus Südwesten. Die Regenwahrscheinlichkeit steigt Mitte der Woche. Der UV-Index liegt bei moderaten 5.',
                'pt': 'Paris aproveita agradáveis 22°C com nuvens dispersas — perfeito para uma tarde ao longo do Sena. O vento é suave a 4,6 m/s do sudoeste. As chances de chuva aumentam no meio da semana. O índice UV está em 5, moderado.',
                'zh': '巴黎正享受着22°C的宜人温度，天空散布着朵朵白云——非常适合在塞纳河畔度过一个下午。西南风温和，风速4.6米/秒。本周中期降雨概率上升。紫外线指数为中等水平5。',
            }
            return lang_demos.get(language, DEMO_AI_BRIEFING)
        return DEMO_AI_BRIEFING

    location_name = _sanitize(location_name)
    lang_instruction = ''
    if language != 'en':
        lang_map = {'es': 'Spanish', 'fr': 'French', 'ja': 'Japanese', 'de': 'German', 'pt': 'Portuguese', 'zh': 'Chinese'}
        lang_instruction = f' Respond entirely in {lang_map.get(language, language)}.'

    try:
        client = _get_client()
        weather_str = json.dumps(weather_data, indent=2)
        response = client.messages.create(
            model=MODEL,
            max_tokens=300,
            system=f'You are a concise, engaging weather narrator. Generate a 3-4 sentence natural language weather briefing that highlights non-obvious insights a commuter or traveler would care about. Include wind chill effects, UV warnings, or timing advice. Be specific with numbers.{lang_instruction}',
            messages=[{
                'role': 'user',
                'content': f'Generate a weather briefing for {location_name}:\n{weather_str}'
            }],
        )
        return response.content[0].text
    except Exception as e:
        logger.error('AI briefing failed: %s', e)
        return ''


def generate_trip_advice(destination, dates, weather_data):
    if config.DEMO_MODE:
        return dict(DEMO_TRIP_ADVICE)

    destination = _sanitize(destination)
    dates = _sanitize(dates)
    if _check_injection(destination) or _check_injection(dates):
        return {'best_days': [], 'packing_list': [], 'activities_to_avoid': [], 'local_tip': ''}

    try:
        client = _get_client()
        weather_str = json.dumps(weather_data, indent=2)
        response = client.messages.create(
            model=MODEL,
            max_tokens=500,
            system='You are a travel weather advisor. Given destination weather data, return JSON with: best_days (array of strings), packing_list (array of strings), activities_to_avoid (array of strings), local_tip (string). Be specific and practical.',
            messages=[{
                'role': 'user',
                'content': f'Destination: {destination}\nDates: {dates}\nWeather data:\n{weather_str}\n\nReturn ONLY valid JSON.'
            }],
        )
        return _parse_json(response.content[0].text)
    except Exception as e:
        logger.error('AI trip advice failed: %s', e)
        return {'best_days': [], 'packing_list': [], 'activities_to_avoid': [], 'local_tip': ''}


def generate_outfit_recommendation(weather_data):
    if config.DEMO_MODE:
        return dict(DEMO_OUTFIT)

    try:
        client = _get_client()
        weather_str = json.dumps(weather_data, indent=2)
        response = client.messages.create(
            model=MODEL,
            max_tokens=300,
            system='You are a weather-based outfit advisor. Given weather conditions, return JSON with a "recommendations" array of exactly 3 objects, each with: icon (single emoji), label (2-4 words), description (one sentence). Focus on practical, non-obvious advice.',
            messages=[{
                'role': 'user',
                'content': f'Weather data:\n{weather_str}\n\nReturn ONLY valid JSON.'
            }],
        )
        return _parse_json(response.content[0].text)
    except Exception as e:
        logger.error('AI outfit recommendation failed: %s', e)
        return {'recommendations': []}


def generate_smart_alerts(forecast_data):
    if config.DEMO_MODE:
        return list(DEMO_SMART_ALERTS)

    try:
        client = _get_client()
        forecast_str = json.dumps(forecast_data, indent=2)
        response = client.messages.create(
            model=MODEL,
            max_tokens=400,
            system='You are a weather risk analyst. Analyze 5-day forecast data and identify non-obvious risks users might miss. Return a JSON array of alert objects with: type (uv/rain/temperature/wind), severity (low/moderate/high), message (one specific actionable sentence). Only include genuine risks, max 4 alerts.',
            messages=[{
                'role': 'user',
                'content': f'Forecast data:\n{forecast_str}\n\nReturn ONLY a valid JSON array.'
            }],
        )
        return _parse_json(response.content[0].text)
    except Exception as e:
        logger.error('AI smart alerts failed: %s', e)
        return []


def generate_mood_score(weather_data):
    if config.DEMO_MODE:
        return dict(DEMO_MOOD)

    try:
        client = _get_client()
        weather_str = json.dumps(weather_data, indent=2)
        response = client.messages.create(
            model=MODEL,
            max_tokens=150,
            system='You are a weather mood scorer. Rate the weather on a scale of 1-10 (10 = perfect outdoor day, 1 = stay inside). Return JSON with: score (integer 1-10), explanation (one sentence explaining the score). Consider temperature comfort, rain, wind, and UV.',
            messages=[{
                'role': 'user',
                'content': f'Weather data:\n{weather_str}\n\nReturn ONLY valid JSON.'
            }],
        )
        return _parse_json(response.content[0].text)
    except Exception as e:
        logger.error('AI mood score failed: %s', e)
        return {'score': None, 'explanation': ''}


def parse_natural_language_query(query):
    if config.DEMO_MODE:
        return {'intent': 'weather_check', 'location': 'Paris', 'date_hint': 'today'}

    query = _sanitize(query)
    if _check_injection(query):
        return None

    try:
        client = _get_client()
        response = client.messages.create(
            model=MODEL,
            max_tokens=150,
            system='Extract weather query intent. Return JSON with: intent (weather_check/forecast_check/activity_check), location (city or place name), date_hint (today/tomorrow/weekend/specific date or null). If location is unclear, use the most likely city.',
            messages=[{
                'role': 'user',
                'content': f'Query: "{query}"\n\nReturn ONLY valid JSON.'
            }],
        )
        return _parse_json(response.content[0].text)
    except Exception as e:
        logger.error('AI natural language parse failed: %s', e)
        return None


def generate_natural_language_answer(query, weather_data, location_name=''):
    if config.DEMO_MODE:
        return DEMO_NL_ANSWER

    query = _sanitize(query)
    location_name = _sanitize(location_name)
    if _check_injection(query):
        return 'Sorry, I could not process your question.'

    try:
        client = _get_client()
        weather_str = json.dumps(weather_data, indent=2)
        response = client.messages.create(
            model=MODEL,
            max_tokens=300,
            system='You are a conversational weather assistant. Answer the user\'s weather question directly and naturally using the provided data. Be specific with numbers and give actionable advice. Keep it to 2-4 sentences.',
            messages=[{
                'role': 'user',
                'content': f'User asked: "{query}"\nLocation: {location_name}\nWeather data:\n{weather_str}\n\nAnswer conversationally.'
            }],
        )
        return response.content[0].text
    except Exception as e:
        logger.error('AI natural language answer failed: %s', e)
        return 'Sorry, I could not process your question right now.'


def plan_my_week(schedule, forecast_data, location_name=''):
    if config.DEMO_MODE:
        return [
            {'event': 'Morning run', 'day': 'Tuesday', 'time': '7:00 AM', 'verdict': 'good', 'reason': 'Clear skies, 16°C — ideal running conditions. UV low at that hour.'},
            {'event': 'Picnic in park', 'day': 'Saturday', 'time': '12:00 PM', 'verdict': 'warning', 'reason': '65% rain chance by noon. Move to Sunday or bring cover — afternoon clears up by 15:00.'},
            {'event': 'Outdoor market', 'day': 'Thursday', 'time': '10:00 AM', 'verdict': 'good', 'reason': 'Overcast but dry, 19°C. Comfortable for walking. Wind picks up after 14:00.'},
        ]

    location_name = _sanitize(location_name)

    try:
        client = _get_client()
        forecast_str = json.dumps(forecast_data, indent=2)
        schedule_str = json.dumps(schedule, indent=2)
        response = client.messages.create(
            model=MODEL,
            max_tokens=500,
            system='You are a weather-aware schedule advisor. Given a user\'s weekly schedule and forecast data, evaluate each event. Return a JSON array of objects with: event (string), day (string), time (string), verdict (good/warning/bad), reason (one specific sentence with numbers). Be honest about risks.',
            messages=[{
                'role': 'user',
                'content': f'Location: {location_name}\nSchedule:\n{schedule_str}\nForecast:\n{forecast_str}\n\nReturn ONLY valid JSON array.'
            }],
        )
        return _parse_json(response.content[0].text)
    except Exception as e:
        logger.error('AI plan week failed: %s', e)
        return []


def generate_comparison_insight(city1_data, city2_data):
    if config.DEMO_MODE:
        return "Paris is 4° warmer than New York right now with significantly lower humidity. If you're choosing between the two for this weekend, Paris offers better outdoor conditions — but New York's rain clears by Saturday afternoon, opening a good window for Central Park."

    try:
        client = _get_client()
        response = client.messages.create(
            model=MODEL,
            max_tokens=250,
            system='You are a weather comparison analyst. Given two cities\' weather data, write 2-3 sentences comparing them practically. Highlight which city is better for outdoor activities right now, and any non-obvious differences (humidity, UV, wind). Be specific with numbers.',
            messages=[{
                'role': 'user',
                'content': f'City 1:\n{json.dumps(city1_data, indent=2)}\n\nCity 2:\n{json.dumps(city2_data, indent=2)}\n\nCompare them.'
            }],
        )
        return response.content[0].text
    except Exception as e:
        logger.error('AI comparison insight failed: %s', e)
        return ''
