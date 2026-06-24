import sqlite3
from datetime import datetime, timezone
from flask import g
from backend import config


def get_db():
    if 'db' not in g:
        g.db = sqlite3.connect(config.DATABASE_PATH, check_same_thread=False)
        g.db.row_factory = sqlite3.Row
        g.db.execute('PRAGMA journal_mode=WAL')
    return g.db


def close_db(e=None):
    db = g.pop('db', None)
    if db is not None:
        db.close()


def init_db(app=None):
    db_path = config.DATABASE_PATH

    conn = sqlite3.connect(db_path)
    conn.executescript('''
        CREATE TABLE IF NOT EXISTS weather_searches (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            city TEXT NOT NULL,
            country TEXT,
            latitude REAL NOT NULL,
            longitude REAL NOT NULL,
            search_query TEXT NOT NULL,
            date_from TEXT,
            date_to TEXT,
            weather_data TEXT NOT NULL,
            forecast_data TEXT,
            notes TEXT DEFAULT '',
            tags TEXT DEFAULT '',
            mood_score INTEGER,
            ai_briefing TEXT,
            created_at TEXT DEFAULT (datetime('now')),
            updated_at TEXT DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS weather_alerts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            location TEXT NOT NULL,
            latitude REAL NOT NULL,
            longitude REAL NOT NULL,
            condition TEXT NOT NULL,
            threshold_value REAL NOT NULL,
            threshold_type TEXT NOT NULL,
            is_triggered INTEGER DEFAULT 0,
            last_checked TEXT,
            created_at TEXT DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS youtube_cache (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            location TEXT NOT NULL UNIQUE,
            videos_json TEXT NOT NULL,
            cached_at TEXT DEFAULT (datetime('now'))
        );
    ''')
    conn.close()


def seed_demo_data():
    import json
    conn = sqlite3.connect(config.DATABASE_PATH)
    count = conn.execute('SELECT COUNT(*) FROM weather_searches').fetchone()[0]
    if count > 0:
        conn.close()
        return

    demos = [
        {
            'city': 'Paris', 'country': 'FR', 'lat': 48.8566, 'lon': 2.3522,
            'query': 'Paris', 'notes': 'Trip planning — Marais walk',
            'tags': 'travel,europe', 'mood': 7,
            'briefing': 'Paris is enjoying pleasant 22°C with scattered clouds — perfect for an afternoon along the Seine.',
            'weather': {'main': {'temp': 22, 'feels_like': 21, 'humidity': 58, 'temp_min': 19, 'temp_max': 25, 'pressure': 1015}, 'weather': [{'id': 802, 'main': 'Clouds', 'description': 'scattered clouds', 'icon': '03d'}], 'wind': {'speed': 4.6, 'deg': 220}, 'visibility': 10000},
        },
        {
            'city': 'Tokyo', 'country': 'JP', 'lat': 35.6762, 'lon': 139.6503,
            'query': 'Tokyo', 'notes': 'Comparing summer humidity',
            'tags': 'travel,asia', 'mood': 6,
            'briefing': 'Tokyo is warm at 28°C with high humidity at 72% — expect sticky conditions if you\'re walking outdoors.',
            'weather': {'main': {'temp': 28, 'feels_like': 31, 'humidity': 72, 'temp_min': 25, 'temp_max': 30, 'pressure': 1010}, 'weather': [{'id': 500, 'main': 'Rain', 'description': 'light rain', 'icon': '10d'}], 'wind': {'speed': 3.2, 'deg': 180}, 'visibility': 8000},
        },
        {
            'city': 'London', 'country': 'GB', 'lat': 51.5074, 'lon': -0.1278,
            'query': 'London', 'notes': 'Checking weekend forecast',
            'tags': 'travel,europe,weekend', 'mood': 5,
            'briefing': 'London is overcast at 14°C with a steady drizzle expected through the afternoon.',
            'weather': {'main': {'temp': 14, 'feels_like': 12, 'humidity': 78, 'temp_min': 11, 'temp_max': 16, 'pressure': 1008}, 'weather': [{'id': 300, 'main': 'Drizzle', 'description': 'light drizzle', 'icon': '09d'}], 'wind': {'speed': 6.1, 'deg': 250}, 'visibility': 7000},
        },
    ]

    for d in demos:
        conn.execute(
            '''INSERT INTO weather_searches
               (city, country, latitude, longitude, search_query, weather_data, notes, tags, mood_score, ai_briefing)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)''',
            (d['city'], d['country'], d['lat'], d['lon'], d['query'],
             json.dumps(d['weather']), d['notes'], d['tags'], d['mood'], d['briefing'])
        )

    conn.execute(
        '''INSERT INTO weather_alerts (location, latitude, longitude, condition, threshold_value, threshold_type)
           VALUES (?, ?, ?, ?, ?, ?)''',
        ('London', 51.5074, -0.1278, 'rain', 70, 'greater_than')
    )

    conn.commit()
    conn.close()


def init_app(app):
    app.teardown_appcontext(close_db)
    with app.app_context():
        init_db(app)
        if not app.config.get('TESTING'):
            seed_demo_data()
