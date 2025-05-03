
from backend.utils.db import get_connection

def fetch_top_products_by_revenue(category=None):
    query = """
        select
            p.id_product,
            p.product_name,
            c.category_name,
            sum(s.selling_price * s.product_number) as total_revenue
        from product p
        join store_product sp on p.id_product = sp.id_product
        join category c       on p.category_number = c.category_number
        join sale s           on sp.UPC = s.UPC
        where c.category_number = coalesce(%s, c.category_number)
        group by p.id_product, p.product_name, c.category_name
        order by total_revenue desc
        limit 5
    """

    params = (category,)

    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(query, params)
            rows = cur.fetchall()
    return [
        {
            "id_product": row[0],
            "product_name": row[1],
            "category_name": row[2],
            "total_revenue": float(row[3]),
        }
        for row in rows
    ]

def fetch_products_not_purchased_within_date(print_date):
    query = f"""
            select distinct p.product_name, p.id_product
            from product p join store_product sp on p.id_product = sp.id_product
                join sale s on sp.UPC = s.UPC
            where sp.UPC not in (
                select UPC
                from sale s join receipt r on r.receipt_number = s.receipt_number
                where r.print_date not in (
                    select print_date
                    from receipt
                    where print_date < %s
                )
            )
            """
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(query, (print_date,))
            products = cur.fetchall()
    return [
        {
            "product_name": row[0],
            "id_product": row[1]
        }
        for row in products
    ]


def fetch_categories_by_revenue_with_min_price_of_product(min_price):
    query = """
        SELECT c.category_name, SUM(sp.selling_price) AS total_revenue
        FROM product p
        JOIN store_product sp ON p.id_product = sp.id_product
        JOIN category c ON p.category_number = c.category_number
        WHERE sp.selling_price > %s
        GROUP BY c.category_name
        ORDER BY total_revenue DESC
    """
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(query, (min_price,))
            categories = cur.fetchall()
    return [
        {
            "category_name": row[0],
            "total_revenue": row[1],
        }
        for row in categories
    ]


def fetch_customers_not_from_category_not_from_cashier(category_id):
    query = """
    SELECT cc.card_number, cc.cust_surname, cc.cust_name
    FROM customer_card cc
    WHERE NOT EXISTS (
        SELECT 1 FROM receipt r
        JOIN sale s ON r.receipt_number = s.receipt_number
        JOIN store_product sp ON s.UPC = sp.UPC
        JOIN product p ON sp.id_product = p.id_product
        WHERE p.category_number = %s 
            AND r.card_number = cc.card_number
    )
    AND NOT EXISTS (
        SELECT 1
        FROM receipt r
        WHERE r.id_employee NOT IN ('E000', 'E1000')
            AND r.card_number = cc.card_number
    )
    """
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(query, (category_id,))
            products = cur.fetchall()
    return [
        {
            "card_number": row[0],
            "cust_surname": row[1],
            "cust_name": row[2],
        }
        for row in products
    ]

from backend.utils.db import get_connection

def fetch_cashiers_with_min_receipts(min_receipts=None):
    query = """
        SELECT
            e.id_employee,
            e.empl_surname || ' ' || e.empl_name || ' ' || e.empl_patronymic AS full_name,
            COUNT(DISTINCT r.receipt_number) AS receipt_count,
            SUM(s.selling_price * s.product_number) AS total_sales
        FROM employee e
        JOIN receipt r ON e.id_employee = r.id_employee
        JOIN sale s ON r.receipt_number = s.receipt_number
        GROUP BY e.id_employee, full_name
        HAVING COUNT(DISTINCT r.receipt_number) >= COALESCE(%s, 0)
        ORDER BY total_sales DESC
    """

    params = (min_receipts,)
    
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(query, params)
            rows = cur.fetchall()
    return [
        {
            "id_employee": row[0],
            "full_name": row[1],
            "receipt_count": row[2],
            "total_sales": float(row[3])
        }
        for row in rows
    ]

def fetch_unpopular_products_for_non_loyal_clients():
    query = """
        SELECT DISTINCT p.id_product, p.product_name, c.category_name
        FROM product p
        JOIN store_product sp ON p.id_product = sp.id_product
        LEFT JOIN category c ON p.category_number = c.category_number
        WHERE NOT EXISTS (
            SELECT 1
            FROM sale s
            JOIN receipt ch ON s.receipt_number = ch.receipt_number
            WHERE s.UPC = sp.UPC
            AND (
                ch.card_number IS NULL
                OR ch.card_number NOT IN (
                    SELECT card_number FROM customer_card
                )
            )
        );
    """
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(query)
            rows = cur.fetchall()
    return [
        {
            "id_product": row[0],
            "product_name": row[1],
            "category": row[2]
        }
        for row in rows
    ]
