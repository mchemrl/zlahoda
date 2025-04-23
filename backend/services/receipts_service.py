from datetime import datetime, timedelta
from decimal import Decimal

from flask import jsonify, session
from psycopg2.extras import RealDictCursor

from backend.utils.db import get_connection


def validate_receipt(data):
    receipt_number = data.get('receipt_number')
    id_employee = session.get('user_id')
    card_number = data.get('card_number')
    print_date = data.get('print_date')
    products_list = data.get('products')

    if not all([receipt_number, id_employee, print_date, products_list]):
        return jsonify({'error': 'missing required fields'}), 400

    if fetch_receipt_by_id(receipt_number) is not None:
        return jsonify({'error': f'receipt with number {receipt_number} already exists'}), 400

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
        is_promo = bool(product.get('is_promo', False))

        if not upc or not quantity:
            return jsonify({'error': 'missing product UPC or quantity'}), 400

        product_data = fetch_store_product_by_id_and_promo(upc, is_promo)
        if product_data is None:
            return jsonify({'error': f'product with UPC {upc} not found'}), 404
        available_quantity = product_data.get('products_number')
        if quantity > available_quantity:
            return jsonify({
                'error': f'not enough stock for product UPC {upc}. '
                         f'Available: {available_quantity}, requested: {quantity}'
            }), 400

        selling_price = product_data['selling_price']
        total_price = selling_price * quantity
        sum_total += total_price

        full_products_list.append({
            'upc': upc,
            'product_number': quantity,
            'selling_price': selling_price,
            'is_promo': is_promo
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
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
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
        try:
            start_date = datetime.strptime(start_date, '%Y-%m-%d')
            end_date = datetime.strptime(end_date, '%Y-%m-%d') + timedelta(days=1)
        except ValueError:
            return jsonify({'error': 'invalid date format, expected YYYY-MM-DD'}), 400
        where_clauses.append('print_date between %s and %s')
        params.append(start_date)
        params.append(end_date)

    if where_clauses:
        query += ' where ' + ' and '.join(where_clauses)

    with get_connection() as conn:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(query, params)
            receipts = cur.fetchall()
        return receipts


def create_receipt(receipt):
    query_receipt = '''
        INSERT INTO receipt (receipt_number, id_employee, card_number, print_date, sum_total, vat)
        VALUES (%s, %s, %s, %s, %s, %s)
    '''
    query_sale = '''
        INSERT INTO sale (upc, receipt_number, product_number, selling_price)
        VALUES (%s, %s, %s, %s)
    '''
    query_update_stock_regular = '''
        UPDATE store_product
        SET products_number = products_number - %s
        WHERE upc = %s AND promotional_product = false
    '''

    query_update_stock_promo = '''
        UPDATE store_product
        SET products_number = products_number - %s
        WHERE upc = %s AND promotional_product = true
    '''

    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(query_receipt, (
                receipt['receipt_number'],
                receipt['id_employee'],
                receipt.get('card_number'),
                receipt['print_date'],
                receipt['sum_total'],
                receipt['vat']
            ))

            for product in receipt['products_list']:
                cur.execute(query_sale, (
                    product['upc'],
                    receipt['receipt_number'],
                    product['product_number'],
                    product['selling_price']
                ))

                if product.get('is_promo'):
                    cur.execute(query_update_stock_promo, (
                        product['product_number'],
                        product['upc']
                    ))
                else:
                    cur.execute(query_update_stock_regular, (
                        product['product_number'],
                        product['upc']
                    ))

        conn.commit()


def dump_receipt(receipt_id):
    query = 'DELETE FROM receipt WHERE receipt_number = %s'
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(query, (receipt_id,))
        conn.commit()


def fetch_store_product_by_id_and_promo(upc, promo_code=False):
    query = '''
        select upc, upc_prom, id_product, selling_price, products_number, promotional_product
        from store_product
        where upc = %s and promotional_product = %s
    '''

    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(query, (upc, promo_code))
            product = cur.fetchone()
            if product is not None:
                return {
                    'upc': product[0],
                    'upc_prom': product[1],
                    'id_product': product[2],
                    'selling_price': product[3],
                    'products_number': product[4],
                    'promotional_product': product[5]
                }
            else:
                return None


def fetch_total_sum(cashier_id=None, start_date=None, end_date=None):
    query = '''
        select sum(sum_total) as total_sum
        from receipt
    '''
    params = []
    where_clauses = []

    if cashier_id is not None:
        where_clauses.append('id_employee = %s')
        params.append(cashier_id)

    if start_date is not None and end_date is not None:
        try:
            start_date = datetime.strptime(start_date, '%Y-%m-%d')
            end_date = datetime.strptime(end_date, '%Y-%m-%d') + timedelta(days=1)
        except ValueError:
            return jsonify({'error': 'invalid date format, expected YYYY-MM-DD'}), 400
        where_clauses.append('print_date between %s and %s')
        params.append(start_date)
        params.append(end_date)

    if where_clauses:
        query += ' where ' + ' and '.join(where_clauses)

    with get_connection() as conn:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(query, params)
            total_sum = cur.fetchone()
        return total_sum


def fetch_product_amount_in_receipts(upc=None, start_date=None, end_date=None):
    query = '''
        SELECT SUM(s.product_number) AS total_product_number
        FROM sale s
        JOIN receipt r ON s.receipt_number = r.receipt_number
    '''
    params = []
    where_clauses = []

    if upc is not None:
        where_clauses.append('s.upc = %s')
        params.append(upc)

    if start_date is not None and end_date is not None:
        try:
            start_date = datetime.strptime(start_date, '%Y-%m-%d')
            end_date = datetime.strptime(end_date, '%Y-%m-%d')
        except ValueError:
            raise ValueError('Invalid date format, expected YYYY-MM-DD')

        where_clauses.append('r.print_date BETWEEN %s AND %s')
        params.append(start_date)
        params.append(end_date)

    if where_clauses:
        query += ' WHERE ' + ' AND '.join(where_clauses)

    with get_connection() as conn:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(query, params)
            result = cur.fetchone()

    return result.get('total_product_number') or 0
