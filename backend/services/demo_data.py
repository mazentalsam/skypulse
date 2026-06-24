DEMO_GEOCODE = {
    'lat': 48.8566,
    'lon': 2.3522,
    'display_name': 'Paris, Ile-de-France, France',
    'city': 'Paris',
    'country': 'FR',
}

DEMO_CURRENT_WEATHER = {
    'coord': {'lon': 2.3522, 'lat': 48.8566},
    'weather': [{'id': 802, 'main': 'Clouds', 'description': 'scattered clouds', 'icon': '03d'}],
    'main': {
        'temp': 22.5, 'feels_like': 21.8, 'temp_min': 19.2, 'temp_max': 25.1,
        'pressure': 1015, 'humidity': 58,
    },
    'visibility': 10000,
    'wind': {'speed': 4.6, 'deg': 220, 'gust': 7.2},
    'clouds': {'all': 40},
    'dt': 1718700000,
    'sys': {'country': 'FR', 'sunrise': 1718678400, 'sunset': 1718735400},
    'timezone': 7200,
    'name': 'Paris',
}

DEMO_AIR_QUALITY = {
    'list': [{
        'main': {'aqi': 2},
        'components': {
            'co': 230.31, 'no': 0.52, 'no2': 15.68, 'o3': 68.42,
            'so2': 1.85, 'pm2_5': 8.12, 'pm10': 12.45, 'nh3': 1.21,
        },
    }]
}

DEMO_UV_INDEX = 5.2

def _make_forecast_item(dt_offset, temp, temp_min, temp_max, desc, icon, pop):
    return {
        'dt': 1718700000 + dt_offset,
        'main': {
            'temp': temp, 'feels_like': temp - 1, 'temp_min': temp_min,
            'temp_max': temp_max, 'pressure': 1015, 'humidity': 55,
        },
        'weather': [{'id': 802, 'main': desc.split()[0].title(), 'description': desc, 'icon': icon}],
        'clouds': {'all': 40},
        'wind': {'speed': 3.5, 'deg': 200},
        'pop': pop,
        'dt_txt': '',
    }

DEMO_FORECAST = {
    'list': [
        _make_forecast_item(0,      22.5, 19.0, 25.0, 'scattered clouds', '03d', 0.1),
        _make_forecast_item(10800,  21.0, 18.0, 23.0, 'few clouds',       '02d', 0.05),
        _make_forecast_item(21600,  19.5, 17.0, 21.0, 'clear sky',        '01n', 0.0),
        _make_forecast_item(32400,  18.0, 16.0, 19.0, 'clear sky',        '01n', 0.0),
        _make_forecast_item(43200,  17.5, 15.0, 18.0, 'few clouds',       '02n', 0.0),
        _make_forecast_item(54000,  18.5, 16.0, 20.0, 'scattered clouds', '03d', 0.05),
        _make_forecast_item(64800,  21.0, 18.0, 24.0, 'light rain',       '10d', 0.45),
        _make_forecast_item(75600,  23.0, 19.0, 26.0, 'overcast clouds',  '04d', 0.2),
        _make_forecast_item(86400,  24.5, 20.0, 27.0, 'broken clouds',    '04d', 0.15),
        _make_forecast_item(97200,  22.0, 19.0, 25.0, 'light rain',       '10d', 0.55),
        _make_forecast_item(108000, 20.0, 17.0, 22.0, 'moderate rain',    '10d', 0.75),
        _make_forecast_item(118800, 18.0, 16.0, 20.0, 'light rain',       '10n', 0.4),
        _make_forecast_item(129600, 17.0, 15.0, 18.0, 'clear sky',        '01n', 0.0),
        _make_forecast_item(140400, 16.5, 14.0, 18.0, 'clear sky',        '01n', 0.0),
        _make_forecast_item(151200, 19.0, 16.0, 22.0, 'few clouds',       '02d', 0.05),
        _make_forecast_item(162000, 24.0, 20.0, 27.0, 'clear sky',        '01d', 0.0),
        _make_forecast_item(172800, 26.0, 22.0, 29.0, 'clear sky',        '01d', 0.0),
        _make_forecast_item(183600, 25.0, 21.0, 28.0, 'few clouds',       '02d', 0.05),
        _make_forecast_item(194400, 22.0, 19.0, 25.0, 'scattered clouds', '03d', 0.1),
        _make_forecast_item(205200, 20.0, 17.0, 22.0, 'broken clouds',    '04n', 0.15),
        _make_forecast_item(216000, 18.5, 16.0, 20.0, 'clear sky',        '01n', 0.0),
        _make_forecast_item(226800, 17.0, 15.0, 19.0, 'clear sky',        '01n', 0.0),
        _make_forecast_item(237600, 19.5, 16.0, 22.0, 'few clouds',       '02d', 0.0),
        _make_forecast_item(248400, 23.0, 19.0, 26.0, 'scattered clouds', '03d', 0.1),
        _make_forecast_item(259200, 25.5, 21.0, 28.0, 'few clouds',       '02d', 0.05),
        _make_forecast_item(270000, 24.0, 20.0, 27.0, 'scattered clouds', '03d', 0.1),
        _make_forecast_item(280800, 21.0, 18.0, 24.0, 'broken clouds',    '04d', 0.2),
        _make_forecast_item(291600, 19.0, 17.0, 21.0, 'overcast clouds',  '04n', 0.15),
        _make_forecast_item(302400, 17.5, 15.0, 19.0, 'few clouds',       '02n', 0.0),
        _make_forecast_item(313200, 16.0, 14.0, 18.0, 'clear sky',        '01n', 0.0),
        _make_forecast_item(324000, 18.0, 15.0, 21.0, 'clear sky',        '01d', 0.0),
        _make_forecast_item(334800, 22.0, 18.0, 25.0, 'few clouds',       '02d', 0.05),
        _make_forecast_item(345600, 24.0, 20.0, 27.0, 'scattered clouds', '03d', 0.1),
        _make_forecast_item(356400, 23.0, 19.0, 26.0, 'light rain',       '10d', 0.6),
        _make_forecast_item(367200, 20.0, 17.0, 23.0, 'moderate rain',    '10d', 0.8),
        _make_forecast_item(378000, 18.0, 16.0, 20.0, 'light rain',       '10n', 0.35),
        _make_forecast_item(388800, 16.5, 14.0, 18.0, 'broken clouds',    '04n', 0.1),
        _make_forecast_item(399600, 15.5, 13.0, 17.0, 'few clouds',       '02n', 0.0),
        _make_forecast_item(410400, 17.0, 14.0, 20.0, 'clear sky',        '01d', 0.0),
        _make_forecast_item(421200, 21.0, 17.0, 24.0, 'clear sky',        '01d', 0.0),
    ],
    'city': {'name': 'Paris', 'country': 'FR', 'coord': {'lat': 48.8566, 'lon': 2.3522}},
}

DEMO_HISTORICAL = {
    'avg_temp': 19.8,
    'avg_humidity': 62,
    'avg_precipitation': 2.1,
}

DEMO_AI_BRIEFING = (
    "Paris is enjoying a pleasant 22°C with scattered clouds — perfect for an afternoon "
    "along the Seine. Wind is mild at 4.6 m/s from the southwest, so outdoor dining is "
    "comfortable. Rain chances creep up mid-week around Wednesday, so plan your museum "
    "visits then. UV index sits at a moderate 5, meaning sunscreen is wise if you're "
    "spending extended time outdoors."
)

DEMO_TRIP_ADVICE = {
    'best_days': ['Monday and Tuesday look ideal — clear skies with temps around 24-26°C.'],
    'packing_list': ['Light layers', 'Comfortable walking shoes', 'Compact umbrella for Wednesday', 'Sunscreen SPF 30+'],
    'activities_to_avoid': ['Skip outdoor picnics on Wednesday — 75% rain chance.', 'Avoid rooftop dining Thursday evening — gusty winds expected.'],
    'local_tip': 'The Marais district has covered passages (Passage des Panoramas, Galerie Vivienne) that are perfect shelter if rain catches you off guard.',
}

DEMO_OUTFIT = {
    'recommendations': [
        {'icon': '👕', 'label': 'Light cotton shirt', 'description': 'Breathable layer for 22°C — you won\'t need a jacket until evening.'},
        {'icon': '🕶️', 'label': 'Sunglasses', 'description': 'UV index at 5 means moderate sun exposure — protect your eyes.'},
        {'icon': '☂️', 'label': 'Compact umbrella', 'description': 'Rain moves in Wednesday. Keep one in your bag just in case.'},
    ]
}

DEMO_SMART_ALERTS = [
    {'type': 'uv', 'severity': 'moderate', 'message': 'UV index hits 7 on Tuesday afternoon even through clouds — apply SPF 30+ before heading out.'},
    {'type': 'rain', 'severity': 'high', 'message': 'Wednesday brings 75% rain probability with moderate intensity — plan indoor activities or carry waterproof gear.'},
    {'type': 'temperature', 'severity': 'low', 'message': 'Overnight temps drop to 15°C by Thursday — bring a light jacket if you\'re out past 9pm.'},
]

DEMO_MOOD = {
    'score': 7,
    'explanation': 'Solid outdoor weather — warm enough for sightseeing, clouds keep it from being too hot. Loses points for mid-week rain risk.',
}

DEMO_NL_ANSWER = (
    "Based on the current forecast for Paris, you won't need an umbrella today or tomorrow — "
    "skies are mostly clear with less than 10% rain chance. However, Wednesday is a different story "
    "with a 75% chance of moderate rain. I'd keep a compact umbrella in your bag starting Tuesday evening."
)

DEMO_YOUTUBE_VIDEOS = [
    {'video_id': 'dQw4w9WgXcQ', 'title': 'Paris Travel Guide 2024 — Top 10 Things to Do', 'thumbnail': 'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg', 'channel': 'Travel Tips'},
    {'video_id': 'dQw4w9WgXcQ', 'title': 'Walking Tour: Paris in the Rain', 'thumbnail': 'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg', 'channel': 'City Walks'},
    {'video_id': 'dQw4w9WgXcQ', 'title': 'Best Cafes in Paris — A Local\'s Guide', 'thumbnail': 'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg', 'channel': 'Foodie Explorer'},
    {'video_id': 'dQw4w9WgXcQ', 'title': 'Paris Weather: What to Expect Month by Month', 'thumbnail': 'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg', 'channel': 'Euro Weather'},
    {'video_id': 'dQw4w9WgXcQ', 'title': 'Hidden Gems of Paris You Can\'t Miss', 'thumbnail': 'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg', 'channel': 'Off the Path'},
]

DEMO_UNSPLASH_PHOTOS = [
    {'id': 'demo1', 'url': 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400', 'description': 'Eiffel Tower at sunset', 'photographer': 'Chris Karidis'},
    {'id': 'demo2', 'url': 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=400', 'description': 'Paris street view', 'photographer': 'Florian Wehde'},
    {'id': 'demo3', 'url': 'https://images.unsplash.com/photo-1431274172761-fca41d930114?w=400', 'description': 'Notre-Dame Cathedral', 'photographer': 'Pedro Lastra'},
]
