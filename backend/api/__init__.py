from flask import Blueprint
from .auth import auth
from .categories import categories
from .products import product
from .store_products import store_product

api = Blueprint('api', __name__, url_prefix='/api')

api.register_blueprint(auth, url_prefix='/auth')
api.register_blueprint(categories, url_prefix='/categories')
api.register_blueprint(product, url_prefix='/products')
api.register_blueprint(store_product, url_prefix='/store_products')

