from flask import session

from backend.utils.db import get_connection

def fetch_store_product(upc):
    with get_connection() as conn:
        with conn.cursor() as cur:
            query = """
                    select upc, upc_prom, p.id_product, selling_price, products_number,
                    promotional_product, c.category_name, p.product_name, p.characteristics
                    from store_product sp
                    join product p on p.id_product = sp.id_product
                    join category c on c.category_number = p.category_number
                    where upc = %s
                    """
            cur.execute(query, (upc,))
            store_product = cur.fetchone()

            if store_product:
                if session.get('role') == 'Manager':
                    return {
                        "upc": store_product[0],
                        "upc_prom": store_product[1],
                        "id_product": store_product[2],
                        "selling_price": store_product[3],
                        "products_number": store_product[4],
                        "promotional_product": store_product[5],
                        "product_name": store_product[7],
                        "characteristics": store_product[8],
                    }
                elif session.get('role') == 'Cashier':
                    return {
                        "upc": store_product[0],
                        "upc_prom": store_product[1],
                        "id_product": store_product[2],
                        "selling_price": store_product[3],
                        "products_number": store_product[4],
                        "promotional_product": store_product[5],
                    }
            else:
                return None

def fetch_store_products(promotional = None, category = None, search = None, sort = 'product_name', descending = False):
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
    if search:
        conditions.append("sp.upc ilike %s")
        parameters.append(f"%{search}%")

    if conditions:
        base_query += " where " + " and ".join(conditions)

    valid_sort_fields = {
        'products_number': 'sp.products_number',
        'product_name': 'p.product_name'}

    if sort in valid_sort_fields:
        base_query += f" order by {valid_sort_fields[sort]}"

    if descending:
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

def create_store_product(UPC,id_product,selling_price,products_number,promotional_product, UPC_prom):
    with get_connection() as conn:
        with conn.cursor() as cur:
            query = """
                           insert into store_product (UPC, UPC_prom, id_product, selling_price, products_number, promotional_product)
                           values (%s, %s, %s, %s, %s, %s)
                           """
            cur.execute(query, (UPC,UPC_prom,id_product,selling_price,products_number,promotional_product))
            conn.commit()

def dump_store_product(upc):
    with get_connection() as conn:
        with conn.cursor() as cur:
            query = 'delete from store_product where upc = %s'
            cur.execute(query, (upc,))
            conn.commit()


def edit_store_product(upc, id_product, selling_price, new_products_number, promotional_product, upc_prom):
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                select upc, products_number, promotional_product, upc_prom
                from store_product
                where upc = %s
            """, (upc,))
            record = cur.fetchone()
            if not record:
                raise ValueError("product not found")

            old_qty, old_flag, stored_upc_prom = record[1], record[2], record[3]

            if old_flag and not promotional_product:
                if new_products_number > 0:
                    cur.execute("""
                        select products_number
                        from store_product
                        where upc = %s
                    """, (stored_upc_prom,))
                    base_qty = cur.fetchone()[0]
                    cur.execute("""
                        update store_product
                        set products_number = %s
                        where upc = %s
                    """, (base_qty + new_products_number, stored_upc_prom))

                cur.execute("""
                    delete from store_product
                    where upc = %s
                """, (upc,))

            else:
                if promotional_product and old_flag:
                    diff = new_products_number - old_qty
                    cur.execute("""
                        select products_number
                        from store_product
                        where upc = %s
                    """, (stored_upc_prom,))
                    base_qty = cur.fetchone()[0]
                    new_base_qty = base_qty - diff
                    if new_base_qty < 0:
                        raise ValueError(
                            f"not enough base product: have {base_qty}, want change by {diff}"
                        )
                    cur.execute("""
                        UPDATE store_product
                        SET products_number = %s
                        WHERE upc = %s
                    """, (new_base_qty, stored_upc_prom))

                cur.execute("""
                    update store_product
                    set upc_prom = %s,
                        id_product = %s,
                        selling_price = %s,
                        products_number = %s,
                        promotional_product = %s
                    where upc = %s
                """, (
                    upc_prom,
                    id_product,
                    selling_price,
                    new_products_number,
                    promotional_product,
                    upc
                ))

            conn.commit()


def save_store_product(UPC, id_product, selling_price, products_number, promotional_product, upc_prom):
    if not promotional_product:
        with get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    select upc, products_number 
                    from store_product 
                    where upc = %s
                """, (UPC,))
                existing = cur.fetchone()

                if existing:
                    old_upc = existing[0]
                    old_qty = existing[1]
                    new_qty = old_qty + products_number
                    edit_store_product(old_upc, id_product, selling_price, new_qty, promotional_product, upc_prom)
                    conn.commit()
                    return old_upc
                else:
                    create_store_product(UPC, id_product, selling_price, products_number, promotional_product, None)
                    conn.commit()
                    return UPC

    else:
        if not upc_prom:
            raise ValueError('for promotional product you need to enter UPC_prom.')

        base_product = fetch_store_product(upc_prom)
        if not base_product:
            raise ValueError('base product not found, so you cannot add promotional.')

        if base_product['promotional_product'] == True:
            raise ValueError('not possible to add promotional product, if base product is promotional')

        if base_product['products_number'] < products_number:
            raise ValueError('not enough quantity of base product to create a promotional product. ' \
                             f'Available {base_product['products_number']}, and you need {products_number}.')

        new_base_qty = base_product['products_number'] - products_number
        edit_store_product(upc_prom, base_product['id_product'], base_product['selling_price'], new_base_qty,
                           base_product['promotional_product'], base_product.get('upc_prom'))

        with get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    select upc, products_number 
                    from store_product 
                    where upc = %s
                """, (UPC,))
                promo_existing = cur.fetchone()

                if promo_existing:
                    old_qty = promo_existing[1]
                    new_qty = old_qty + products_number
                    edit_store_product(UPC, id_product, selling_price, new_qty, promotional_product, upc_prom)
                else:
                    create_store_product(UPC, id_product, selling_price, products_number, promotional_product, upc_prom)
                conn.commit()
        return UPC


def fetch_store_product_by_id_product_and_promo(id_product, promotional_product):
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                select upc
                from store_product
                where id_product = %s and promotional_product = %s
            """, (id_product, promotional_product))
            row = cur.fetchone()
            if not row:
                return None
            return {'upc': row[0]}
