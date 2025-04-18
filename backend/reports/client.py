from backend.services.client_service import fetch_clients
from backend.utils.report import create_report_blueprint

client_report = create_report_blueprint(
    bp_name='client_report',
    import_name=__name__,
    fetch_func=fetch_clients,
    template_path='reports/client_report.html',
    filename='client_report.pdf'
)
