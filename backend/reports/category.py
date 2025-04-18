from backend.utils.report import create_report_blueprint
from backend.services.categories_service import fetch_categories

category_report = create_report_blueprint(
    bp_name='category_report',
    import_name=__name__,
    fetch_func=fetch_categories,
    template_path='reports/category_report.html',
    filename='category_report.pdf'
)
