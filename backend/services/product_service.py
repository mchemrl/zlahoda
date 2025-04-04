from backend.db import get_connection

def get_products():
    cur = get_connection().cursor()
    cur.execute('select * from product;')
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

def get_product(id_product):
    cur = get_connection().cursor()
    query = 'select * from product where id = %s'
    cur.execute(query, (id_product,))
    product = cur.fetchone()
    if product:
        return {
            "id": product[0],
            "category_number": product[1],
            "product_name": product[2],
        }

def add_product(id_product, category_number, product_name, characteristics):
    cur = get_connection().cursor()
    query = """
        insert into product (id_product, category_number, product_name, characteristics)
        values (%s, %s, %s, %s)
    """
    cur.execute(query, (id_product, category_number, product_name, characteristics))
    get_connection().commit()
    cur.close()

def delete_product(id_product):
    cur = get_connection().cursor()
    query = 'delete from product where id_product = %s'
    cur.execute(query, (id_product,))
    get_connection().commit()
    cur.close()

def update_product(id_product, category_number, product_name, characteristics):
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