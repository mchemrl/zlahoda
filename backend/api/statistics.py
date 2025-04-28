from flask import Blueprint, request, jsonify, Response
from backend.utils.decorators import manager_required
from backend.services.statistics_service import fetch_top_products_by_revenue
from backend.services.chart_service import generate_revenue_chart

statistics = Blueprint('statistics', __name__)

@statistics.route('/', methods=('GET',))
#@manager_required
def top_products_by_revenue():
    category = request.args.get('category')
    top_prod = fetch_top_products_by_revenue(category)
    if top_prod:
        return jsonify(top_prod)
    else:
        return jsonify({'error': 'Nothing in this category.'})

@statistics.route('/chart', methods=['GET'])
def revenue_chart():
    category = request.args.get('category')
    data = fetch_top_products_by_revenue(category)
    png_bytes = generate_revenue_chart(data)
    return Response(png_bytes, mimetype='image/png')



