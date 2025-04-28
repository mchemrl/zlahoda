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