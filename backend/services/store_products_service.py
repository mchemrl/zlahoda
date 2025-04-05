from backend.db import get_connection

def fetch_store_product(upc):
    with get_connection() as conn:
        with conn.cursor() as cur:
            query = """
                    select upc, upc_prom, p.id_product, selling_price, products_number,
                    promotional_product, c.category_name, p.product_name
                    from store_product sp
                    join product p on p.id_product = sp.id_product
                    join category c on c.category_number = p.category_number
                    where upc = %s
                    """
            cur.execute(query, (upc,))
            store_product = cur.fetchone()

            if store_product:
                return {
                    "upc": store_product[0],
                    "upc_prom": store_product[1],
                    "id_product": store_product[2],
                    "selling_price": store_product[3],
                    "products_number": store_product[4],
                    "promotional_product": store_product[5],
                    "category": store_product[6],
                    "product_name": store_product[7],
                }
            else:
                return None

def fetch_store_products(promotional, category, sort, search, descending = False):
    base_query = """
        select sp.UPC,sp.UPC_prom, p.id_product, p.product_name, sp.selling_price,
            sp.products_number, sp.promotional_product, c.category_name
        from store_product sp
        join product p on sp.id_product = p.id_product
        join category c on p.category_number = c.category_number
    """

    conditions = list()
    parameters = list()

    if category is not None:
        conditions.append("c.category_number = %s")
        parameters.append(category)
    if promotional is not None:
        conditions.append("sp.promotional_product = %s")
        if promotional.lower() == 'true':
            parameters.append(True)
        elif promotional.lower() == 'false':
            parameters.append(False)

    if search is not None:
        conditions.append("product_name ilike %s")
        parameters.append(f"%{search}%")

    if conditions:
        base_query += " where " + " and ".join(conditions)

    valid_sort_fields = {
        'products_number': 'sp.products_number',
        'product_name': 'p.product_name'}

    if sort in valid_sort_fields:
        base_query += f" order by {valid_sort_fields[sort]}"

    if descending:
        print('fsf')
        base_query += " desc"

    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(base_query, tuple(parameters))
            store_products = cur.fetchall()

    return [
            {
            "upc": row[0],
            "upc_prom": row[1],
            "id_product": row[2],
            "product_name": row[3],
            "selling_price": float(row[4]),
            "products_number": row[5],
            "promotional_product": row[6],
            "category": row[7]
            }
        for row in store_products
    ]

def create_store_product():
    pass

def dump_store_product():
    pass

def edit_store_product():
    pass