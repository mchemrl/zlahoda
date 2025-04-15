from flask import Blueprint
from products_report import product_report

reports = Blueprint('reports', __name__, url_prefix='/reports')

reports.register_blueprint(product_report, url_prefix='/reports_products')
