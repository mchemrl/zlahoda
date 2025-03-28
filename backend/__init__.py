import os
from flask import Flask
from dotenv import load_dotenv
from flask_cors import CORS

SUPABASE_URL = os.getenv("supabase_url")


def create_app():
    load_dotenv()

    app = Flask(__name__,
                template_folder='../frontend',
                static_folder='../frontend/static')
    app.config['SECRET_KEY'] = "I can do it with a broken heart"

    from .views import views
    from .auth import auth
    from .queries import queries

    app.register_blueprint(views, url_prefix='/')
    app.register_blueprint(auth, url_prefix='/')
    app.register_blueprint(queries, url_prefix='/')

    CORS(app, resources={r"/*": {"origins": "*"}})

    return app
