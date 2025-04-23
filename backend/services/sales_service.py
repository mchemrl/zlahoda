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
                SELECT upc, receipt_number, product_number, selling_price
                FROM sale
                WHERE receipt_number = %s
                '''
            cur.execute(query, (receipts_id,))
            sale = cur.fetchone()
            return sale
