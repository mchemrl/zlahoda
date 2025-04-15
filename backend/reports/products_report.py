from flask import Blueprint, render_template, request, send_file, make_response, current_app
from backend.services.products_service import fetch_products
from backend.decorators import login_required
import pdfkit
import os
import tempfile

product_report = Blueprint('product_reports', __name__)

@product_report.route('/products/report/preview', methods=['GET'])
@login_required
def products_report_preview():
    products = fetch_products()
    return render_template('reports/products_report.html', products=products)


@product_report.route('/products/report/pdf', methods=['GET'])
@login_required
def export_products_pdf():
    products = fetch_products()
    html = render_template('reports/products_report.html', products=products)

    config = pdfkit.configuration(wkhtmltopdf=current_app.config.get('WKHTMLTOPDF_PATH', None))
    options = {
        'disable-smart-shrinking': '',
        'no-outline': None,
    }

    try:
        pdf = pdfkit.from_string(html, False, configuration=config, options=options)
    except Exception as e:
        return str(e), 500

    response = make_response(pdf)
    response.headers['Content-Type'] = 'application/pdf'
    response.headers['Content-Disposition'] = 'attachment; filename=products_report.pdf'
    return response