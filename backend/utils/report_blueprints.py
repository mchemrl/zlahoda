from backend.utils.report import create_report_blueprint
from backend.services.categories_service import fetch_categories
from backend.services.client_service import fetch_clients
from backend.services.employees_service import fetch_employees
from backend.services.products_service import fetch_products
from backend.services.receipts_service import fetch_receipts
from backend.services.store_products_service import fetch_store_products

category_report = create_report_blueprint(
    bp_name='category_report',
    import_name=__name__,
    fetch_func=fetch_categories,
    template_path='reports/category_report.html',
    filename='category_report.pdf'
)

client_report = create_report_blueprint(
    bp_name='client_report',
    import_name=__name__,
    fetch_func=fetch_clients,
    template_path='reports/client_report.html',
    filename='client_report.pdf'
)

employee_report = create_report_blueprint(
    bp_name='employee_report',
    import_name=__name__,
    fetch_func=fetch_employees,
    template_path='reports/employee_report.html',
    filename='employee_report.pdf'
)

product_report = create_report_blueprint(
    bp_name='product_report',
    import_name=__name__,
    fetch_func=fetch_products,
    template_path='reports/product_report.html',
    filename='product_report.pdf'
)

receipt_report = create_report_blueprint(
    bp_name='receipt_report',
    import_name=__name__,
    fetch_func=fetch_receipts,
    template_path='reports/receipt_report.html',
    filename='receipt_report.pdf'
)

store_product_report = create_report_blueprint(
    bp_name='store_product_report',
    import_name=__name__,
    fetch_func=fetch_store_products,
    template_path='reports/store_product_report.html',
    filename='store_product_report.pdf'
)
