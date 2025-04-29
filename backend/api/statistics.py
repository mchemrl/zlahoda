from flask import Blueprint, request, jsonify, Response
from backend.services.statistics_service import fetch_top_products_by_revenue, fetch_products_not_purchased_within_date, \
    fetch_unsold_products_from_not_category_in_period_of_time, fetch_average_selling_price_by_categories
from backend.services.chart_service import generate_revenue_chart, generate_average_selling_price_chart
from datetime import datetime

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


@statistics.route('/average_selling_price_by_categories', methods=['GET'])
def average_selling_price_by_categories():
    categories = fetch_average_selling_price_by_categories()
    if categories:
        return jsonify(categories)
    else:
        return jsonify({'error': 'No data found'})


@statistics.route('/average_selling_price_by_categories_chart', methods=['GET'])
def average_selling_price_by_categories_chart():
    data = fetch_average_selling_price_by_categories()
    png_bytes = generate_average_selling_price_chart(data)
    return Response(png_bytes, mimetype='image/png')


@statistics.route('/unsold_products_from_not_category_in_period_of_time', methods=['GET'])
def unsold_products_from_not_category_in_period_of_time():
    category_id = request.args.get('category_id')
    if category_id is None:
        return jsonify({'error': 'You must choose a category'}), 400

    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    if start_date is None or end_date is None:
        return jsonify({'error': 'You must choose a start and end date'}), 400
    try:
        start_date = datetime.strptime(start_date, '%Y-%m-%d')
        end_date = datetime.strptime(end_date, '%Y-%m-%d')
    except ValueError:
        return jsonify({'error': 'Invalid date format. Use YYYY-MM-DD.'}), 400

    if start_date > end_date:
        return jsonify({'error': 'Start date must be before end date'}), 400

    unsold_products = fetch_unsold_products_from_not_category_in_period_of_time(category_id, start_date, end_date)
    if unsold_products:
        return jsonify(unsold_products)
    else:
        return jsonify({'error': 'No data for this time range.'})
