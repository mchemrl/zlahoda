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
    data = request.json
    id_product = data.get('id_product')
    UPC = data.get('UPC')
    UPC_prom = data.get('UPC_prom') or None
    selling_price = data.get('selling_price')
    products_number = data.get('products_number')
    promotional_product = data.get('promotional_product', False)

    if not id_product or not UPC or not selling_price or not products_number:
        return jsonify({'error': 'missing required fields'}), 400

    create_store_product(UPC, id_product, selling_price, products_number, promotional_product, UPC_prom);

    return jsonify({'message': 'product added!'}), 200

@store_product.route('/', methods=['DELETE'])
def delete_store_product():
    upc = request.args.get('upc', type=str)
    if not upc:
        return jsonify({'error': 'missing upc'}), 400

    store_product = fetch_store_product(upc)
    if not store_product:
        return jsonify({'error': 'store product not found'}), 404

    dump_store_product(upc)
    return jsonify({'message': 'store product deleted!'}), 200

@store_product.route('/', methods=['PUT'])
def update_store_product():
    upc = request.args.get('upc', type=str)
    if not upc:
        return jsonify({'error': 'missing upc'}), 400

    store_product = fetch_store_product(upc)
    if not store_product:
        return jsonify({'error': 'store product not found'}), 404

    data = request.json
    upc_prom = data.get('upc_prom')
    id_product = data.get('id_product')
    selling_price = data.get('selling_price')
    products_number = data.get('products_number')
    promotional_product = data.get('promotional_product', False)

    edit_store_product(upc, id_product, selling_price, products_number, promotional_product, upc_prom)
    return jsonify({
        'upc': upc,
        'id': id_product,
        'selling_price': selling_price,
        'products_number': products_number,
        'promotional_product': promotional_product
    }), 200


