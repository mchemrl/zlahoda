from flask import Blueprint
from .auth import auth
from .categories import categories
from .products import product

api = Blueprint('api', __name__, url_prefix='/api')

api.register_blueprint(auth, url_prefix='/auth')
api.register_blueprint(categories, url_prefix='/categories')
api.register_blueprint(product, url_prefix='/product')
