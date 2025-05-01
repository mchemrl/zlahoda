from flask import Blueprint, request, jsonify, Response
from backend.services.statistics_service import fetch_top_products_by_revenue, fetch_products_not_purchased_within_date, \
    fetch_categories_by_revenue_with_min_price_of_product, fetch_customers_not_from_category_not_from_cashier
from backend.services.chart_service import generate_revenue_chart, generate_average_selling_price_chart
from decimal import Decimal

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


@statistics.route('/categories_by_revenue_with_min_price_of_product', methods=['GET'])
def categories_by_revenue_with_min_price_of_product():
    min_price = request.args.get('min_price')
    if min_price is None:
        return jsonify({'error': 'You must choose a minimum price'}), 400
    try:
        min_price = Decimal(min_price)
    except ValueError:
        return jsonify({'error': 'Invalid min_price'}), 400
    if min_price <= 0:
        return jsonify({'error': 'Minimum price must be greater than 0'}), 400

    categories = fetch_categories_by_revenue_with_min_price_of_product(min_price)
    if categories:
        return jsonify(categories)
    else:
        return jsonify({'error': 'No data found'})


@statistics.route('/categories_by_revenue_with_min_price_of_product_chart', methods=['GET'])
def categories_by_revenue_with_min_price_of_product_chart():
    min_price = request.args.get('min_price')
    if min_price is None:
        return jsonify({'error': 'You must choose a minimum price'}), 400
    try:
        min_price = Decimal(min_price)
    except ValueError:
        return jsonify({'error': 'Invalid min_price'}), 400
    if min_price <= 0:
        return jsonify({'error': 'Minimum price must be greater than 0'}), 400
    data = fetch_categories_by_revenue_with_min_price_of_product(min_price)
    png_bytes = generate_average_selling_price_chart(data)
    return Response(png_bytes, mimetype='image/png')


@statistics.route('/customers_not_from_category_not_from_cashier', methods=['GET'])
def customers_not_from_category_not_from_cashier():
    category_id = request.args.get('category_id')

    if category_id is None:
        return jsonify({'error': 'You must choose a category'}), 400

    customers = fetch_customers_not_from_category_not_from_cashier(category_id)
    if customers:
        return jsonify(customers)
    else:
        return jsonify({'error': 'No data found'})
