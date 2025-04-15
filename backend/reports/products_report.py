from flask import Blueprint, render_template, make_response
from backend.services.products_service import fetch_products
from backend.decorators import login_required
from xhtml2pdf import pisa
from io import BytesIO

products_report = Blueprint('product_reports', __name__)

@products_report.route('/preview', methods=['GET'])
@login_required
def products_report_preview():
    products = fetch_products()
    return render_template('reports/products_report.html', products=products)

@products_report.route('/pdf', methods=['GET'])
@login_required
def export_products_pdf():
    products = fetch_products()
    html = render_template('reports/products_report.html', products=products)

    pdf_buffer = BytesIO()
    try:
        pisa_status = pisa.CreatePDF(html, dest=pdf_buffer)
        if pisa_status.err:
            return f"PDF generation failed: {pisa_status.err}", 500
    except Exception as e:
        return str(e), 500

    pdf_buffer.seek(0)
    response = make_response(pdf_buffer.read())
    response.headers['Content-Type'] = 'application/pdf'
    response.headers['Content-Disposition'] = 'attachment; filename=products_report.pdf'
    return response
