from flask import Blueprint
from .auth import auth
from .categories import categories
from .employees import employees
from .products import products
from .store_products import store_product
from .client import client

api = Blueprint('api', __name__, url_prefix='/api')

api.register_blueprint(auth, url_prefix='/auth')
api.register_blueprint(categories, url_prefix='/categories')
api.register_blueprint(products, url_prefix='/products')
api.register_blueprint(employees, url_prefix='/employees')
api.register_blueprint(store_product, url_prefix='/store_products')
api.register_blueprint(client, url_prefix='/client')