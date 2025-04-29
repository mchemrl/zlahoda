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


def fetch_average_selling_price_by_categories():
    query = """
        SELECT c.category_name, AVG(sp.selling_price) AS average_selling_price
        FROM product p
        JOIN store_product sp ON p.id_product = sp.id_product
        JOIN category c ON p.category_number = c.category_number
        GROUP BY c.category_name
        ORDER BY average_selling_price DESC
    """
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(query)
            categories = cur.fetchall()
    return [
        {
            "category_name": row[0],
            "average_selling_price": row[1],
        }
        for row in categories
    ]


def fetch_unsold_products_from_not_category_in_period_of_time(category_id, start_date, end_date):
    query = """
        SELECT p.product_name, sp.selling_price, c.category_name, sp.products_number, sp.promotional_product, sp.upc
        FROM store_product sp
        JOIN product p ON sp.id_product = p.id_product
        JOIN category c ON p.category_number = c.category_number
        WHERE p.category_number NOT IN (
            SELECT category_number
            FROM category
            WHERE category_number = %s
        )
        AND NOT EXISTS (
            SELECT 1
            FROM sale s
            JOIN receipt r ON s.receipt_number = r.receipt_number
            WHERE sp.upc = s.upc
            AND r.print_date BETWEEN %s AND %s
        )
        ORDER BY sp.products_number * sp.selling_price DESC
    """
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(query, (category_id, start_date, end_date))
            products = cur.fetchall()
    return [
        {
            "product_name": row[0],
            "selling_price": row[1],
            "category_name": row[2],
            "products_number": row[3],
            "promotional_product": row[4],
            "upc": row[5],
        }
        for row in products
    ]
