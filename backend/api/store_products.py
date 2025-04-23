import psycopg2
from flask import Blueprint, request, jsonify

from backend.utils.decorators import manager_required
from ..services.store_products_service import (fetch_store_products, fetch_store_product,
                                               edit_store_product, dump_store_product,
                                               create_store_product, save_store_product,
                                               fetch_store_product_by_id_product_and_promo)

store_product = Blueprint('store_products', __name__)

DISCOUNT_RATE = 0.80

@store_product.route('/', methods=['GET'])
def get_store_products():
    upc = request.args.get('upc', type=str)
    promotional = request.args.get('promotional')
    sort = request.args.get('sort')
    category = request.args.get('category')
    descending = request.args.get('descending')

    if upc:
        store_product = fetch_store_product(upc)
        if store_product:
            return jsonify(store_product)
        else:
            return jsonify({'error': 'store product not found'}), 404
    else:
        products = fetch_store_products(promotional, category, sort, descending)
        return jsonify(products)

@store_product.route('/', methods=('POST',))
#@manager_required
def add_store_product():
    data = request.json
    id_product = data.get('id_product')
    UPC = data.get('upc')
    UPC_prom = data.get('upc_prom') or None
    products_number = data.get('products_number')
    promotional_product = data.get('promotional_product', False)

    if not id_product or not UPC or not products_number:
        return jsonify({'error': 'missing required fields'}), 400

    existing = fetch_store_product_by_id_product_and_promo(id_product, promotional_product)
    if existing:
        return jsonify({'error': 'store product with this id_product and promotional flag already exists'}), 400

    if promotional_product:
        base = fetch_store_product(UPC_prom)
        if not base:
            return jsonify({'error': 'base product not found for promo'}), 400
        selling_price = round(float(base['selling_price']) * DISCOUNT_RATE, 2)
    else:
        selling_price = data.get('selling_price')
        if not selling_price or selling_price <= 0:
            return jsonify({'error': 'invalid selling_price'}), 400

    if products_number <= 0:
        return jsonify({'error': 'invalid products_number'}), 400

    upc_used = save_store_product(
        UPC,
        int(id_product),
        float(selling_price),
        int(products_number),
        bool(promotional_product),
        UPC_prom
    )

    prod = fetch_store_product(upc_used)
    if not prod:
        return jsonify({'error': 'failed to fetch created product'}), 500

    gross = float(prod['selling_price'])
    net = round(gross / 1.2, 2)
    vat = round(gross - net, 2)
    final = gross

    return jsonify({
        'upc': upc_used,
        'id_product': prod['id_product'],
        'products_number': prod['products_number'],
        'promotional_product': prod['promotional_product'],
        'prices': {
            'gross_price': gross,
            'net_price': net,
            'vat_amount': vat,
            'final_price': final
        }
    }), 200


@store_product.route('/', methods=['DELETE'])
#@manager_required
def delete_store_product():
    upc = request.args.get('upc', type=str)
    if not upc:
        return jsonify({'error': 'missing upc'}), 400

    existing = fetch_store_product(upc)
    if not existing:
        return jsonify({'error': 'store product not found'}), 404

    dump_store_product(upc)
    return jsonify({'message': 'store product deleted!'}), 200

@store_product.route('/', methods=['PUT'])
#@manager_required
def update_store_product():
    upc = request.args.get('upc', type=str)
    if not upc:
        return jsonify({'error': 'missing upc'}), 400

    existing = fetch_store_product(upc)
    if not existing:
        return jsonify({'error': 'store product not found'}), 404

    orig_id = existing['id_product']
    orig_promo = existing['promotional_product']
    orig_upc_prom = existing.get('upc_prom')

    data = request.json or dict()
    new_price = data.get('selling_price', existing['selling_price'])
    new_qty   = data.get('products_number', existing['products_number'])

    edit_store_product(
        upc,
        orig_id,
        float(new_price),
        int(new_qty),
        orig_promo,
        orig_upc_prom
    )

    if not orig_promo:
        promo_conflict = fetch_store_product_by_id_product_and_promo(orig_id, True)
        if promo_conflict:
            promo_upc = promo_conflict['upc']
            promo_rec = fetch_store_product(promo_upc)

            new_promo_price = round(float(new_price) * DISCOUNT_RATE, 2)

            old_base_qty  = existing['products_number']
            delta = int(new_qty) - old_base_qty
            new_promo_qty = promo_rec['products_number']
            if delta < 0:
                new_promo_qty = max(new_promo_qty + delta, 0)

            edit_store_product(
                promo_upc,
                orig_id,
                new_promo_price,
                new_promo_qty,
                True,
                promo_rec.get('upc_prom')
            )

    updated = fetch_store_product(upc)
    gross = float(updated['selling_price'])
    net   = round(gross / 1.2, 2)
    vat   = round(gross - net, 2)
    final = round(gross * (DISCOUNT_RATE if updated['promotional_product'] else 1), 2)

    return jsonify({
        'upc': upc,
        'id_product': updated['id_product'],
        'products_number': updated['products_number'],
        'promotional_product': updated['promotional_product'],
        'prices': {
            'gross_price': gross,
            'net_price': net,
            'vat_amount': vat,
            'final_price': final
        }
    }), 200
