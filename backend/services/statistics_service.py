from backend.utils.db import get_connection


def fetch_top_products_by_revenue(category=None):
    base_query = """
            select p.id_product, p.product_name, c.category_name, sum(s.selling_price * s.product_number) as total_revenue
            from product p join store_product sp on p.id_product = sp.id_product
                join category c on p.category_number = c.category_number
                join sale s on sp.UPC = s.UPC
            """

    conditions = list()
    parameters = list()

    if category is not None:
        conditions.append("c.category_number = %s")
        parameters.append(category)

    if conditions:
        base_query += " where " + " and ".join(conditions)

    query = base_query + """
        group by p.id_product, p.product_name, c.category_name
        order by total_revenue desc
        limit 5
    """

    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(query, tuple(parameters))
            products = cur.fetchall()
    return [
        {
            "id_product": row[0],
            "product_name": row[1],
            "total_revenue": row[3],
        }
        for row in products
    ]


def fetch_products_not_purchased_within_date(print_date):
    query = f"""
            select distinct p.product_name
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
            "product_name": row[0]
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
    WHERE cc.card_number NOT IN (
        SELECT DISTINCT r.card_number
        FROM receipt r
        JOIN sale s ON r.receipt_number = s.receipt_number
        JOIN store_product sp ON s.UPC = sp.UPC
        JOIN product p ON sp.id_product = p.id_product
        WHERE p.category_number = %s AND r.card_number IS NOT NULL
    )
    AND cc.card_number NOT IN (
        SELECT DISTINCT r.card_number
        FROM receipt r
        WHERE r.id_employee = 'E000'
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
