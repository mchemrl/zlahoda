from flask import Blueprint
from .auth import auth
from .categories import categories
from .employees import employees
from .products import products

api = Blueprint('api', __name__, url_prefix='/api')

api.register_blueprint(auth, url_prefix='/auth')
api.register_blueprint(categories, url_prefix='/categories')
api.register_blueprint(products, url_prefix='/products')
api.register_blueprint(employees, url_prefix='/employees')
