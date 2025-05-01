
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




