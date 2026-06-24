from flask import Blueprint, jsonify
from backend import config
from backend.database import get_db

health_bp = Blueprint('health', __name__)


@health_bp.route('/health', methods=['GET'])
def health_check():
    """System health check — DB connection, API key status, version.
    ---
    tags:
      - System
    responses:
      200:
        description: Health status of all subsystems
    """
    db_connected = False
    try:
        db = get_db()
        db.execute('SELECT 1')
        db_connected = True
    except Exception:
        pass

    return jsonify({
        'status': 'ok',
        'demo_mode': config.DEMO_MODE,
        'cache_backend': 'SimpleCache',
        'db_connected': db_connected,
        'apis': {
            'openweathermap': 'configured' if config.OPENWEATHERMAP_API_KEY else 'not configured',
            'anthropic': 'configured' if config.ANTHROPIC_API_KEY else 'not configured',
            'youtube': 'configured' if config.YOUTUBE_API_KEY else 'not configured',
            'unsplash': 'configured' if config.UNSPLASH_ACCESS_KEY else 'not configured',
        },
        'version': '1.0.0',
    })
