from backend.utils.report import create_report_blueprint
from backend.services.products_service import fetch_products

product_report = create_report_blueprint(
    bp_name='product_report',
    import_name=__name__,
    fetch_func=fetch_products,
    template_path='reports/product_report.html',
    filename='product_report.pdf'
)
