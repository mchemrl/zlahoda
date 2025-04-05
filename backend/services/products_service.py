from backend.db import get_connection

def fetch_products(category=None, search=None):
    base_query = 'select * from product'
    conditions = list()
    parameters = list()

    if category is not None:
        conditions.append("category_number = %s")
        parameters.append(category)

    if search is not None:
        conditions.append("product_name ilike %s")
        parameters.append(f"%{search}%")

    if conditions:
        base_query += " where " + " and ".join(conditions)

    base_query += " order by product_name;"

    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(base_query, tuple(parameters))
            products = cur.fetchall()

    return [
        {
            "id": row[0],
            "category_number": row[1],
            "product_name": row[2],
            "characteristics": row[3]
        }
        for row in products
    ]

def fetch_product(id_product):
    with get_connection() as conn:
        with conn.cursor() as cur:
            query = 'select * from product where id_product = %s'
            cur.execute(query, (id_product,))
            product = cur.fetchone()

            if product:
                return {
                    "id": product[0],
                    "category_number": product[1],
                    "product_name": product[2],
                    "characteristics": product[3]
                }
            else:
                return None


def create_product(id_product, category_number, product_name, characteristics):
    with get_connection() as conn:
        with conn.cursor() as cur:
            query = """
                insert into product (id_product, category_number, product_name, characteristics)
                values (%s, %s, %s, %s) 
            """
            cur.execute(query, (id_product, category_number, product_name, characteristics))
            conn.commit()

def dump_product(id_product):
    with get_connection() as conn:
        with conn.cursor() as cur:
            query = 'delete from product where id_product = %s'
            cur.execute(query, (id_product,))
            conn.commit()

def edit_product(id_product, category_number, product_name, characteristics):
    with get_connection() as conn:
        with conn.cursor() as cur:
            query = '''
                update product
                set category_number = %s,
                    product_name = %s,
                    characteristics = %s
                where id_product = %s
            '''
            cur.execute(query, (category_number, product_name, characteristics, id_product))
            conn.commit()
