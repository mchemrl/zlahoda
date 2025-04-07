from flask import Flask
from flask_cors import CORS

#from backend.db import close_connection


def create_app():
    """Create and configure the app."""
    app = Flask(__name__,
                template_folder='../frontend',
                static_folder='../frontend/static')
    app.config['SECRET_KEY'] = "I can do it with a broken heart"
    CORS(app, resources={r"/*": {"origins": "*", "methods": ["GET", "POST", "PUT", "DELETE"]}})

    from .views import views
    from backend.api import api

    app.register_blueprint(views, url_prefix='/')
    app.register_blueprint(api)

    CORS(app, resources={r"/*": {"origins": "*"}})

    #app.teardown_appcontext(close_connection)

    return app
