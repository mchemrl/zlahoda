# backend/utils/report_generator.py
from flask import Blueprint, render_template, make_response
from xhtml2pdf import pisa
from io import BytesIO
from backend.utils.decorators import manager_required


def create_report_blueprint(bp_name, import_name, fetch_func, template_path, filename):
    bp = Blueprint(bp_name, import_name)

    @bp.route('/preview', methods=['GET'])
    @manager_required
    def preview():
        items = fetch_func()
        return render_template(template_path, products=items)

    @bp.route('/pdf', methods=['GET'])
    @manager_required
    def export_pdf():
        items = fetch_func()
        html = render_template(template_path, products=items)
        return _generate_pdf_response(html, filename)

    return bp


def _generate_pdf_response(html, filename):
    buf = BytesIO()
    status = pisa.CreatePDF(html, dest=buf)
    if status.err:
        return f"PDF generation failed: {status.err}", 500
    buf.seek(0)
    resp = make_response(buf.read())
    resp.headers['Content-Type'] = 'application/pdf'
    resp.headers['Content-Disposition'] = f'attachment; filename={filename}'
    return resp
