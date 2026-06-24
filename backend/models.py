import json
from datetime import datetime, timezone
from backend.database import get_db


# ── Weather Searches CRUD ──

def create_search(data):
    db = get_db()
    cursor = db.execute(
        '''INSERT INTO weather_searches
           (city, country, latitude, longitude, search_query, date_from, date_to,
            weather_data, forecast_data, notes, tags, mood_score, ai_briefing)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)''',
        (
            data['city'], data.get('country', ''), data['latitude'], data['longitude'],
            data['search_query'], data.get('date_from'), data.get('date_to'),
            json.dumps(data['weather_data']), json.dumps(data.get('forecast_data', {})),
            data.get('notes', ''), data.get('tags', ''),
            data.get('mood_score'), data.get('ai_briefing', '')
        )
    )
    db.commit()
    return get_search_by_id(cursor.lastrowid)


def get_all_searches():
    db = get_db()
    rows = db.execute(
        'SELECT * FROM weather_searches ORDER BY created_at DESC'
    ).fetchall()
    return [_row_to_search_dict(r) for r in rows]


def get_search_by_id(search_id):
    db = get_db()
    row = db.execute(
        'SELECT * FROM weather_searches WHERE id = ?', (search_id,)
    ).fetchone()
    if row is None:
        return None
    return _row_to_search_dict(row)


def update_search(search_id, data):
    db = get_db()
    fields = []
    values = []
    for key in ('notes', 'tags', 'mood_score', 'ai_briefing'):
        if key in data:
            fields.append(f'{key} = ?')
            values.append(data[key])
    if not fields:
        return get_search_by_id(search_id)
    fields.append("updated_at = datetime('now')")
    values.append(search_id)
    db.execute(
        f'UPDATE weather_searches SET {", ".join(fields)} WHERE id = ?',
        values
    )
    db.commit()
    return get_search_by_id(search_id)


def delete_search(search_id):
    db = get_db()
    db.execute('DELETE FROM weather_searches WHERE id = ?', (search_id,))
    db.commit()


def _row_to_search_dict(row):
    d = dict(row)
    for key in ('weather_data', 'forecast_data'):
        if d.get(key):
            try:
                d[key] = json.loads(d[key])
            except (json.JSONDecodeError, TypeError):
                pass
    return d


# ── Weather Alerts CRUD ──

def create_alert(data):
    db = get_db()
    cursor = db.execute(
        '''INSERT INTO weather_alerts
           (location, latitude, longitude, condition, threshold_value, threshold_type)
           VALUES (?, ?, ?, ?, ?, ?)''',
        (
            data['location'], data['latitude'], data['longitude'],
            data['condition'], data['threshold_value'], data['threshold_type']
        )
    )
    db.commit()
    return get_alert_by_id(cursor.lastrowid)


def get_all_alerts():
    db = get_db()
    rows = db.execute(
        'SELECT * FROM weather_alerts ORDER BY created_at DESC'
    ).fetchall()
    return [dict(r) for r in rows]


def get_alert_by_id(alert_id):
    db = get_db()
    row = db.execute(
        'SELECT * FROM weather_alerts WHERE id = ?', (alert_id,)
    ).fetchone()
    return dict(row) if row else None


def get_alerts_for_location(lat, lon, tolerance=0.1):
    db = get_db()
    rows = db.execute(
        '''SELECT * FROM weather_alerts
           WHERE ABS(latitude - ?) < ? AND ABS(longitude - ?) < ?''',
        (lat, tolerance, lon, tolerance)
    ).fetchall()
    return [dict(r) for r in rows]


def update_alert(alert_id, data):
    db = get_db()
    fields = []
    values = []
    for key in ('condition', 'threshold_value', 'threshold_type'):
        if key in data:
            fields.append(f'{key} = ?')
            values.append(data[key])
    if not fields:
        return get_alert_by_id(alert_id)
    values.append(alert_id)
    db.execute(
        f'UPDATE weather_alerts SET {", ".join(fields)} WHERE id = ?',
        values
    )
    db.commit()
    return get_alert_by_id(alert_id)


def update_alert_triggered(alert_id, is_triggered):
    db = get_db()
    db.execute(
        '''UPDATE weather_alerts
           SET is_triggered = ?, last_checked = datetime('now')
           WHERE id = ?''',
        (1 if is_triggered else 0, alert_id)
    )
    db.commit()


def delete_alert(alert_id):
    db = get_db()
    db.execute('DELETE FROM weather_alerts WHERE id = ?', (alert_id,))
    db.commit()


# ── YouTube Cache ──

def get_cached_videos(location):
    db = get_db()
    row = db.execute(
        'SELECT * FROM youtube_cache WHERE location = ?', (location.lower(),)
    ).fetchone()
    if row is None:
        return None
    cached_at = datetime.fromisoformat(row['cached_at'])
    if (datetime.now(timezone.utc) - cached_at.replace(tzinfo=timezone.utc)).total_seconds() > 3600:
        db.execute('DELETE FROM youtube_cache WHERE id = ?', (row['id'],))
        db.commit()
        return None
    try:
        return json.loads(row['videos_json'])
    except (json.JSONDecodeError, TypeError):
        return None


def cache_videos(location, videos):
    db = get_db()
    db.execute(
        '''INSERT OR REPLACE INTO youtube_cache (location, videos_json, cached_at)
           VALUES (?, ?, datetime('now'))''',
        (location.lower(), json.dumps(videos))
    )
    db.commit()


# ── Dashboard Stats ──

def get_dashboard_stats():
    db = get_db()
    total = db.execute('SELECT COUNT(*) as cnt FROM weather_searches').fetchone()['cnt']
    if total == 0:
        return {'total_searches': 0, 'top_city': None, 'avg_mood': None, 'temp_ranges': [], 'tag_counts': {}}

    top_city = db.execute(
        'SELECT city, COUNT(*) as cnt FROM weather_searches GROUP BY city ORDER BY cnt DESC LIMIT 1'
    ).fetchone()

    avg_mood = db.execute(
        'SELECT AVG(mood_score) as avg FROM weather_searches WHERE mood_score IS NOT NULL'
    ).fetchone()['avg']

    rows = db.execute(
        'SELECT city, weather_data FROM weather_searches ORDER BY created_at DESC LIMIT 20'
    ).fetchall()

    temp_ranges = []
    for row in rows:
        try:
            wd = json.loads(row['weather_data']) if isinstance(row['weather_data'], str) else row['weather_data']
            temp_ranges.append({
                'city': row['city'],
                'temp': wd.get('main', {}).get('temp'),
                'temp_min': wd.get('main', {}).get('temp_min'),
                'temp_max': wd.get('main', {}).get('temp_max'),
            })
        except (json.JSONDecodeError, TypeError):
            pass

    all_tags = db.execute('SELECT tags FROM weather_searches WHERE tags != ""').fetchall()
    tag_counts = {}
    for row in all_tags:
        for tag in row['tags'].split(','):
            tag = tag.strip()
            if tag:
                tag_counts[tag] = tag_counts.get(tag, 0) + 1

    return {
        'total_searches': total,
        'top_city': dict(top_city) if top_city else None,
        'avg_mood': round(avg_mood, 1) if avg_mood else None,
        'temp_ranges': temp_ranges,
        'tag_counts': tag_counts,
    }
