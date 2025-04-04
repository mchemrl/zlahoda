from flask import Blueprint, request, jsonify
from ..services.product_service import get_products, get_product, update_product, delete_product, add_product

product = Blueprint('product', __name__)

@product.route('/product', methods = ('GET',))
def get_products():
    product_list = get_products()
    return jsonify(product_list)

@product.route('/product/<int:id_product>', methods = ('GET',))
def get_product(id_product):
    product = get_product(id_product)
    return jsonify(product)

@product.route('/product', methods=['POST'])
def add_product():
    data = request.json
    id_product = data.get('id_product')
    category_number = data.get('category_number')
    product_name = data.get('product_name')
    characteristics = data.get('characteristics')

    if not id_product or not category_number or not product_name or not characteristics:
        return jsonify({'error': 'missing required fields'}), 400

    add_product(id_product, category_number, product_name, characteristics)
    return jsonify({"message": "product added"}), 201

@product.route('/product/<int:id_product>', methods=['DELETE'])
def delete_product(id_product):
    delete_product(id_product)
    return jsonify({'message': 'product deleted!'}), 200

@product.route('/product/<int:id_product>', methods=['PUT'])
def update_product(id_product):
    data = request.json
    category_number = data.get('category_number')
    product_name = data.get('product_name')
    characteristics = data.get('characteristics')

    if not category_number or not product_name or not characteristics:
        return jsonify({'error': 'missing required fields'}), 400

    update_product(id_product, category_number, product_name, characteristics)
    return jsonify({
        'id': id_product,
        'category_number': category_number,
        'product_name': product_name,
        'characteristics': characteristics
    }), 200


