from decimal import Decimal

from flask import jsonify
from datetime import datetime

from backend.db import get_connection
from backend.services.store_products_service import fetch_store_product


def validate_receipt(data):
    receipt_number = data.get('receipt_number')
    id_employee = data.get('id_employee')
    card_number = data.get('card_number')
    print_date = data.get('print_date')
    products_list = data.get('products')

    if not all([receipt_number, id_employee, print_date, products_list]):
        return jsonify({'error': 'missing required fields'}), 400

    if not isinstance(print_date, datetime):
        try:
            print_date = datetime.strptime(print_date, '%Y-%m-%d')
        except ValueError:
            return jsonify({'error': 'invalid print_date format, expected YYYY-MM-DD'}), 400

    sum_total = 0
    full_products_list = []

    for product in products_list:
        upc = product.get('upc')
        quantity = product.get('product_number')

        if not upc or not quantity:
            return jsonify({'error': 'missing product UPC or quantity'}), 400

        product_data = fetch_store_product(upc)
        if product_data is None:
            return jsonify({'error': f'product with UPC {upc} not found'}), 404

        selling_price = product_data['selling_price']
        total_price = selling_price * quantity
        sum_total += total_price

        full_products_list.append({
            'upc': upc,
            'product_number': quantity,
            'selling_price': selling_price
        })

    vat = sum_total * Decimal('0.2')

    return {
        'receipt_number': receipt_number,
        'id_employee': id_employee,
        'card_number': card_number,
        'print_date': print_date,
        'products_list': full_products_list,
        'sum_total': sum_total,
        'vat': vat
    }


def fetch_receipt_by_id(receipt_id):
    query = '''
        select receipt_number, id_employee, card_number, print_date, sum_total, vat
        from receipt
        where receipt_number = %s
    '''
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(query, (receipt_id,))
            receipt = cur.fetchone()
        return receipt


def fetch_receipts(cashier_id=None, start_date=None, end_date=None):
    query = '''
        select receipt_number, id_employee, card_number, print_date, sum_total, vat
        from receipt
    '''
    params = []
    where_clauses = []

    if cashier_id is not None:
        where_clauses.append('id_employee = %s')
        params.append(cashier_id)

    if start_date is not None and end_date is not None:
        where_clauses.append('print_date between %s and %s')
        params.append(start_date)
        params.append(end_date)

    if where_clauses:
        query += ' where ' + ' and '.join(where_clauses)

    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(query, params)
            receipts = cur.fetchall()
        return receipts


def create_receipt(receipt):
    query = '''
        INSERT INTO receipt (receipt_number, id_employee, card_number, print_date, sum_total, vat)
        VALUES (%s, %s, %s, %s, %s, %s)
    '''
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(query, (
                receipt['receipt_number'],
                receipt['id_employee'],
                receipt.get('card_number'),
                receipt['print_date'],
                receipt['sum_total'],
                receipt['vat']
            ))

            for upc in receipt['products_list']:
                cur.execute('''
                    INSERT INTO sale (upc, receipt_number, product_number, selling_price)
                    VALUES (%s, %s, %s, %s)
                ''', (
                    upc['upc'],
                    receipt['receipt_number'],
                    upc['product_number'],
                    upc['selling_price']
                ))
        conn.commit()


def dump_receipt(receipt_id):
    query = 'DELETE FROM receipt WHERE receipt_number = %s'
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(query, (receipt_id,))
        conn.commit()
