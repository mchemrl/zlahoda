from backend.services.employees_service import fetch_employees
from backend.utils.report import create_report_blueprint

employee_report = create_report_blueprint(
    bp_name='employee_report',
    import_name=__name__,
    fetch_func=fetch_employees,
    template_path='reports/employee_report.html',
    filename='employee_report.pdf'
)