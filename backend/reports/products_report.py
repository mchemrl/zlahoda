from backend.utils.report import create_report_blueprint
from backend.services.products_service import fetch_products

products_report = create_report_blueprint(
    bp_name='products_report',
    import_name=__name__,
    fetch_func=fetch_products,
    template_path='reports/products_report.html',
    filename='products_report.pdf'
)
