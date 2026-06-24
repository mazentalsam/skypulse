import os
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

DEMO_MODE = os.getenv('DEMO_MODE', 'false').lower() == 'true'
FLASK_DEBUG = os.getenv('FLASK_DEBUG', 'false').lower() == 'true'

_secret = os.getenv('FLASK_SECRET_KEY')
if not _secret:
    raise RuntimeError(
        'FLASK_SECRET_KEY is not set. '
        'Generate one with: python -c "import secrets; print(secrets.token_hex(32))"'
    )
FLASK_SECRET_KEY = _secret

ALLOWED_ORIGINS = os.getenv('ALLOWED_ORIGINS', 'http://localhost:5173').split(',')
CONTACT_EMAIL = os.getenv('CONTACT_EMAIL', 'noreply@skypulse.app')

OPENWEATHERMAP_API_KEY = os.getenv('OPENWEATHERMAP_API_KEY', '')
YOUTUBE_API_KEY = os.getenv('YOUTUBE_API_KEY', '')
UNSPLASH_ACCESS_KEY = os.getenv('UNSPLASH_ACCESS_KEY', '')
ANTHROPIC_API_KEY = os.getenv('ANTHROPIC_API_KEY', '')

DATABASE_PATH = os.path.join(os.path.dirname(__file__), 'weather.db')
