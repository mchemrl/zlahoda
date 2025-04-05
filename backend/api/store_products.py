import psycopg2
from flask import Blueprint, request, jsonify

from ..services.store_products_service import fetch_store_products, fetch_store_product, edit_store_product, dump_store_product, create_store_product

store_product = Blueprint('store_products', __name__)

@store_product.route('/', methods=['GET'])
def get_store_products():
    upc = request.args.get('upc', type=str)
    promotional = request.args.get('promotional')
    sort = request.args.get('sort')
    category = request.args.get('category')
    search = request.args.get('search')
    descending = request.args.get('descending')

    if upc:
        store_product = fetch_store_product(upc)
        if store_product:
            return jsonify(store_product)
        else:
            return jsonify({'error': 'store product not found'}), 404
    else:
        products = fetch_store_products(promotional, category, sort, search, descending)
        return jsonify(products)

@store_product.route('/', methods=('POST',))
def add_store_product():
    pass

@store_product.route('/', methods=['DELETE'])
def delete_store_product():
    pass

@store_product.route('/', methods=['PUT'])
def update_store_product():
    pass
