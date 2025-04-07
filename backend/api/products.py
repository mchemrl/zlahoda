import psycopg2
from flask import Blueprint, request, jsonify

from ..services.products_service import fetch_products, fetch_product, edit_product, dump_product, create_product

products = Blueprint('products', __name__)

@products.route('/', methods=['GET'])
def get_products():
    id_product = request.args.get('id_product', type=int)
    category = request.args.get('category')
    search = request.args.get('search')
    descending = request.args.get('descending')

    if id_product is not None:
        product = fetch_product(id_product)
        if product:
            return jsonify(product)
        else:
            return jsonify({'error': 'product not found'}), 404

    products = fetch_products(category, search, descending)
    return jsonify(products)

@products.route('/', methods=('POST',))
def add_product():
    data = request.json
    id_product = data.get('id_product')
    category_number = data.get('category_number')
    product_name = data.get('product_name')
    characteristics = data.get('characteristics')

    if not id_product or not category_number or not product_name or not characteristics:
        return jsonify({'error': 'missing required fields'}), 400

    create_product(id_product, category_number, product_name, characteristics);

    return jsonify({'message': 'product added!'}), 200


@products.route('/', methods=['DELETE'])
def delete_product():
    id_product = request.args.get('id_product', type=int)
    if not id_product:
        return jsonify({'error': 'missing id_fsfsproduct'}), 400

    product = fetch_product(id_product)
    if not product:
        return jsonify({'error': 'product not found'}), 404

    try:
        dump_product(id_product)
        return jsonify({'message': 'product deleted!'}), 200
    except psycopg2.IntegrityError as e:
        if 'foreign key constraint' in str(e).lower():
            return jsonify({'error': 'cannot delete product because it has associated store products'}), 400
        else:
            return jsonify({'error': 'database error: ' + str(e)}), 500

    return jsonify({'message': 'product deleted!'}), 200

@products.route('/', methods=['PUT'])
def update_product():
    id_product = request.args.get('id_product', type=int)
    if not id_product:
        return jsonify({'error': 'missing id_product'}), 400

    product = fetch_product(id_product)
    if not product:
        return jsonify({'error': 'product not found'}), 404

    data = request.json
    category_number = data.get('category_number')
    product_name = data.get('product_name')
    characteristics = data.get('characteristics')

    if not category_number or not product_name or not characteristics:
        return jsonify({'error': 'missing required fields'}), 400

    edit_product(id_product, category_number, product_name, characteristics)
    return jsonify({
        'id': id_product,
        'category_number': category_number,
        'product_name': product_name,
        'characteristics': characteristics
    }), 200

