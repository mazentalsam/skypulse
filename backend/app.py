from flask import Flask
from flask_cors import CORS
from flasgger import Swagger
from backend import config
from backend.database import init_app
from backend.extensions import cache, limiter

SWAGGER_TEMPLATE = {
    'info': {
        'title': 'SkyPulse Weather API',
        'description': 'AI-powered weather intelligence platform — built by Mazen for PM Accelerator.',
        'version': '1.0.0',
    },
    'basePath': '/api',
}

SWAGGER_CONFIG = {
    'headers': [],
    'specs': [{
        'endpoint': 'apispec',
        'route': '/apispec.json',
    }],
    'static_url_path': '/flasgger_static',
    'swagger_ui': True,
    'specs_route': '/docs',
}


def create_app(test_config=None):
    app = Flask(__name__)
    app.config['SECRET_KEY'] = config.FLASK_SECRET_KEY
    app.config['CACHE_TYPE'] = 'SimpleCache'
    app.config['CACHE_DEFAULT_TIMEOUT'] = 600

    if test_config:
        app.config.update(test_config)

    CORS(app, resources={r'/api/*': {'origins': config.ALLOWED_ORIGINS}})
    cache.init_app(app)
    limiter.init_app(app)
    init_app(app)

    Swagger(app, template=SWAGGER_TEMPLATE, config=SWAGGER_CONFIG)

    from backend.routes.crud import crud_bp
    from backend.routes.alerts import alerts_bp
    from backend.routes.health import health_bp
    from backend.routes.weather import weather_bp
    from backend.routes.ai import ai_bp
    from backend.routes.youtube import youtube_bp
    from backend.routes.export import export_bp

    app.register_blueprint(crud_bp, url_prefix='/api')
    app.register_blueprint(alerts_bp, url_prefix='/api')
    app.register_blueprint(health_bp, url_prefix='/api')
    app.register_blueprint(weather_bp, url_prefix='/api')
    app.register_blueprint(ai_bp, url_prefix='/api')
    app.register_blueprint(youtube_bp, url_prefix='/api')
    app.register_blueprint(export_bp, url_prefix='/api')

    return app


if __name__ == '__main__':
    app = create_app()
    app.run(debug=config.FLASK_DEBUG, port=5000)
