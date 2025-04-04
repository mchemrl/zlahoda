from flask import Blueprint, request, jsonify

from ..services.products_service import fetch_products, fetch_product, edit_product, dump_product, create_product

product = Blueprint('products', __name__)

@product.route('/', methods=['GET'])
def get_products():
    category = request.args.get('category')
    search = request.args.get('search')

    products = fetch_products(category, search)
    return jsonify(products)


@product.route('/', methods=['GET'])
def get_product():
    id_product = request.args.get('id_product', type=int)
    if not id_product:
        return jsonify({'error': 'missing id_product'}), 400

    product = fetch_product(id_product)
    if product:
        return jsonify(product)
    else:
        return jsonify({'error': 'product not found'}), 404


@product.route('/', methods=('POST',))
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


@product.route('/', methods=['DELETE'])
def delete_product():
    id_product = request.args.get('id_product', type=int)
    if not id_product:
        return jsonify({'error': 'missing id_fsfsproduct'}), 400

    product = fetch_product(id_product)
    if not product:
        return jsonify({'error': 'product not found'}), 404

    dump_product(id_product)
    return jsonify({'message': 'product deleted!'}), 200

@product.route('/', methods=['PUT'])
def update_product():
    id_product = request.args.get('id_product', type=int)
    if not id_product:
        return jsonify({'error': 'missing id_product'}), 400

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

