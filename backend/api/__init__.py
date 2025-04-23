from flask import Blueprint
from .auth import auth
from .categories import categories
from .employees import employees
from .products import products
from .receipts import receipts
from .sales import sales
from .store_products import store_product
from .client import client

from backend.utils.report_blueprints import (product_report, store_product_report,
                                             category_report, client_report, employee_report, receipt_report)

api = Blueprint('api', __name__, url_prefix='/api')

api.register_blueprint(auth, url_prefix='/auth')
api.register_blueprint(categories, url_prefix='/categories')
api.register_blueprint(products, url_prefix='/products')
api.register_blueprint(employees, url_prefix='/employees')
api.register_blueprint(store_product, url_prefix='/store_products')
api.register_blueprint(client, url_prefix='/client')
api.register_blueprint(receipts, url_prefix='/receipts')
api.register_blueprint(sales, url_prefix='/sales')

api.register_blueprint(product_report, url_prefix='/products/report')
api.register_blueprint(store_product_report, url_prefix='/store_products/report')
api.register_blueprint(category_report, url_prefix='/categories/report')
api.register_blueprint(client_report, url_prefix='/client/report')
api.register_blueprint(employee_report, url_prefix='/employees/report')
api.register_blueprint(receipt_report, url_prefix='/receipts/report')