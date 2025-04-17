from psycopg2.extras import RealDictCursor

from backend.db import get_connection


def fetch_sales():
    with get_connection() as conn:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            query = '''
                SELECT receipt_number, id_employee, card_number, print_date, sum_total, vat
                FROM receipt
            '''
            cur.execute(query)
            sales = cur.fetchall()
            return sales


def fetch_sale_by_id(sale_id):
    with get_connection() as conn:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            query = '''
                SELECT receipt_number, id_employee, card_number, print_date, sum_total, vat
                FROM receipt
                WHERE receipt_number = %s
            '''
            cur.execute(query, (sale_id,))
            sale = cur.fetchone()
            return sale
