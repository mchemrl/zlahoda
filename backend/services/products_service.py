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

    cur = get_connection().cursor()
    cur.execute(base_query, tuple(parameters))
    products = cur.fetchall()
    cur.close()

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
    cur = get_connection().cursor()
    query = 'select * from product where id_product = %s'
    cur.execute(query, (id_product,))
    product = cur.fetchone()
    if product:
        return {
            "id": product[0],
            "category_number": product[1],
            "product_name": product[2],
        }

def create_product(id_product, category_number, product_name, characteristics):
    cur = get_connection().cursor()
    query = """
        insert into product (id_product, category_number, product_name, characteristics)
        values (%s, %s, %s, %s) returning id_product
    """
    cur.execute(query, (id_product, category_number, product_name, characteristics))
    prod = cur.fetchone()[0]
    if prod:
        print('cool')
    else:
        print('not cool')
    get_connection().commit()
    cur.close()

def dump_product(id_product):
    cur = get_connection().cursor()
    query = 'delete from product where id_product = %s'
    cur.execute(query, (id_product,))
    get_connection().commit()
    cur.close()

def edit_product(id_product, category_number, product_name, characteristics):
    cur = get_connection().cursor()
    query = '''
        update product
        set category_number = %s,
            product_name = %s,
            characteristics = %s
        where id_product = %s
    '''
    cur.execute(query, (category_number, product_name, characteristics, id_product))
    get_connection().commit()
    cur.close()