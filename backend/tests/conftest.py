import os
import tempfile
import pytest

os.environ['DEMO_MODE'] = 'true'
os.environ.setdefault('FLASK_SECRET_KEY', 'test-secret-key-not-for-production')

from backend.app import create_app
from backend import config


@pytest.fixture
def app():
    db_fd, db_path = tempfile.mkstemp(suffix='.db')
    config.DATABASE_PATH = db_path

    app = create_app({'TESTING': True})

    yield app

    os.close(db_fd)
    os.unlink(db_path)


@pytest.fixture
def client(app):
    return app.test_client()


@pytest.fixture
def sample_search_data():
    return {
        'city': 'Paris',
        'country': 'FR',
        'latitude': 48.8566,
        'longitude': 2.3522,
        'search_query': 'Paris',
        'weather_data': {
            'main': {'temp': 22.5, 'feels_like': 21.8, 'humidity': 58, 'temp_min': 19, 'temp_max': 25},
            'weather': [{'id': 802, 'main': 'Clouds', 'description': 'scattered clouds', 'icon': '03d'}],
            'wind': {'speed': 4.6},
        },
        'notes': '',
        'tags': '',
    }


@pytest.fixture
def sample_alert_data():
    return {
        'location': 'Paris',
        'latitude': 48.8566,
        'longitude': 2.3522,
        'condition': 'temperature',
        'threshold_value': 30.0,
        'threshold_type': 'greater_than',
    }
