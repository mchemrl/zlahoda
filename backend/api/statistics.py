from flask import Blueprint, request, jsonify, Response
from backend.services.statistics_service import fetch_top_products_by_revenue, fetch_products_not_purchased_within_date
from backend.services.chart_service import generate_revenue_chart

statistics = Blueprint('statistics', __name__)

@statistics.route('/top_products', methods=('GET',))
def top_products_by_revenue():
    category = request.args.get('category')
    top_prod = fetch_top_products_by_revenue(category)
    if top_prod:
        return jsonify(top_prod)
    else:
        return jsonify({'error': 'Nothing in this category.'})

@statistics.route('/chart_products', methods=['GET'])
def revenue_chart():
    category = request.args.get('category')
    data = fetch_top_products_by_revenue(category)
    if not data:
        return Response("No data to generate chart", status=204)
    png_bytes = generate_revenue_chart(data)
    return Response(png_bytes, mimetype='image/png')

@statistics.route('/not_purchased_products', methods=['GET'])
def products_not_purchased_within_date():
    print_date = request.args.get('print_date')
    if not print_date:
        return jsonify({'error': 'print_date is required'}), 400
    prod = fetch_products_not_purchased_within_date(print_date)
    if prod:
        return jsonify(prod)
    else:
        return jsonify({'error': 'No data for this time range.'})
