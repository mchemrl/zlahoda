from flask import Flask
from flask_cors import CORS


def create_app():
    """Create and configure the app."""
    app = Flask(__name__,
                template_folder='../frontend',
                static_folder='../frontend/static')
    app.config['SECRET_KEY'] = "ICanDoItWithABrokenHeart"
    CORS(app,
         resources={r"/*": {
             "origins": "*",
             "methods": ["GET", "POST", "PUT", "DELETE"],
             "supports_credentials": True,
         }})

    app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
    app.config['SESSION_COOKIE_SECURE'] = False
    app.config['SESSION_COOKIE_HTTPONLY'] = True
    app.config['SESSION_COOKIE_PATH'] = '/'

    from backend.api import api
    app.register_blueprint(api)

    return app
