from backend.utils.report import create_report_blueprint
from backend.services.store_products_service import fetch_store_products

store_products_report = create_report_blueprint(
    bp_name='store_products_report',
    import_name=__name__,
    fetch_func=fetch_store_products,
    template_path='reports/store_products_report.html',
    filename='store_products_report.pdf'
)
