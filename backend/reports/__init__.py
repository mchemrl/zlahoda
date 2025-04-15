from flask import Blueprint
from products_report import products

reports = Blueprint('reports', __name__, url_prefix='/reports')

reports.register_blueprint(products, url_prefix='/reports_products')
