from psycopg2.extras import RealDictCursor

from backend.utils.db import get_connection


def fetch_sales():
    with get_connection() as conn:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            query = '''
                SELECT upc, receipt_number, product_number, selling_price
                FROM sale
                '''
            cur.execute(query)
            sales = cur.fetchall()
            return sales


def fetch_sale_by_id(receipts_id):
    with get_connection() as conn:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            query = '''
                SELECT s.upc, s.receipt_number, s.product_number, s.selling_price, p.product_name
                FROM sale s
                JOIN store_product sp ON s.upc = sp.upc
                JOIN product p ON sp.id_product = p.id_product
                WHERE s.receipt_number = %s
            '''
            cur.execute(query, (receipts_id,))
            sales = cur.fetchall() 
            return sales if sales else [] 
