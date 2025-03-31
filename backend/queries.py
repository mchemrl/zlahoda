import psycopg2
from flask import Blueprint, jsonify, request
from backend import SUPABASE_URL

queries = Blueprint('queries', __name__)

@queries.route('/get_categories', methods=['GET'])
def get_categories():
    try:
        conn = psycopg2.connect(SUPABASE_URL)
        cur = conn.cursor()

        cur.execute("select * from category;")
        categories = cur.fetchall()
        category_list = list()
        for row in categories:
            category_list.append({
                "id": row[0],
                "category_name": row[1]
            })

        cur.close()
        conn.close()

        return jsonify(category_list)

    except Exception as e:
        return jsonify({'error': str(e)})

@queries.route('/get_products', methods=['GET'])
def get_products():
    try:
        conn = psycopg2.connect(SUPABASE_URL)
        cur = conn.cursor()

        cur.execute("select * from product;")
        products = cur.fetchall()
        product_list = list()
        for row in products:
            product_list.append({
                "id": row[0],
                "category_number": row[1],
                "product_name": row[2],
                "characteristics": row[3]
            })

        cur.close()
        conn.close()

        return jsonify(product_list)

    except Exception as e:
        return jsonify({'error': str(e)})

@queries.route('/get_store_products', methods=['GET'])
def get_store_products():
    try:
        conn = psycopg2.connect(SUPABASE_URL)
        cur = conn.cursor()

        query = '''
        select sp.UPC, sp.UPC_prom, sp.id_product, sp.selling_price, sp.products_number, sp.promotional_product, p.product_name
        from store_product sp
        join product p on sp.id_product = p.id_product
        '''
        cur.execute(query)

        store_products = cur.fetchall()
        store_product_list = []
        for row in store_products:
            store_product_list.append({
                'UPC': row[0],
                'UPC_prom': row[1],
                'id_product': row[2],
                'selling_price': row[3],
                'products_number': row[4],
                'promotional_product': row[5],
                'product_name': row[6]
            })

        cur.close()
        conn.close()

        return jsonify(store_product_list), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@queries.route('/add_store_product', methods=['POST'])
def add_store_product():
    try:
        data = request.json
        id_product = data.get('id_product')
        UPC = data.get('UPC')
        UPC_prom = data.get('UPC_prom') or None
        selling_price = data.get('selling_price')
        products_number = data.get('products_number')
        promotional_product = data.get('promotional_product', False)

        if promotional_product:
            UPC_prom = UPC

        if not id_product or not UPC or not selling_price or not products_number:
            return jsonify({'error': 'missing required fields'}), 400

        conn = psycopg2.connect(SUPABASE_URL)
        cur = conn.cursor()

        query = """
               insert into store_product (UPC, UPC_prom, id_product, selling_price, products_number, promotional_product)
               values (%s, %s, %s, %s, %s, %s)
               """

        cur.execute(query, (
            UPC,
            UPC_prom,
            id_product,
            selling_price,
            products_number,
            promotional_product
        ))

        conn.commit()
        cur.close()
        conn.close()

        return jsonify({'message': ' store product added'}), 201

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@queries.route('/delete_store_product/<string:upc>', methods=['DELETE'])
def delete_store_product():
    try:
        data = request.get_json()
        upc = data.get('UPC')

        conn = psycopg2.connect(SUPABASE_URL)
        cur = conn.cursor()

        query = 'delete from store_product where UPC = %s'
        cur.execute(query, (upc,))
        conn.commit()
        cur.close()

        return jsonify({'message': 'product deleted!'}), 201

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@queries.route('/update_store_product/<string:upc>', methods=['PUT'])
def update_store_product():
    try:
        data = request.get_json()
        old_upc = data.get('old_UPC')
        new_upc = data.get('new_UPC')
        id_product = data.get('id_product')
        selling_price = data.get('selling_price')
        products_number = data.get('products_number')
        promotional_product = data.get('promotional_product')

        conn = psycopg2.connect(SUPABASE_URL)
        cur = conn.cursor()
        query = '''
        update store_product
        set UPC = %s,
            id_product = %s,
            selling_price = %s,
            products_number = %s,
            promotional_product = %s,
            UPC_prom = case 
                          when %s then %s
                          else UPC_prom
                      end
        where UPC = %s
        '''

        cur.execute(query, (new_upc, id_product, selling_price, products_number, promotional_product,
                            promotional_product, new_upc, old_upc))
        conn.commit()
        cur.close()

        return jsonify({'message': 'product updated !!'}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@queries.route('/add_product', methods=['POST'])
def add_product():
    try:
        data = request.json
        id_product = data.get('id_product')
        category_number = data.get('category_number')
        product_name = data.get('product_name')
        characteristics = data.get('characteristics')


        if not id_product or not category_number or not product_name or not characteristics:
            return jsonify({'error': 'mssing required fields'}), 400

        conn = psycopg2.connect(SUPABASE_URL)
        cur = conn.cursor()

        query = """
               insert into product (id_product, category_number, product_name, characteristics)
               values (%s, %s, %s, %s)
               """

        cur.execute(query, (id_product, category_number, product_name, characteristics))
        conn.commit()
        cur.close()
        conn.close()

        return jsonify({"message": "product added"}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@queries.route('/delete_product/<int:id_product>', methods=['DELETE'])
def delete_product(id_product):
    try:
        conn = psycopg2.connect(SUPABASE_URL)
        cur = conn.cursor()

        query = 'delete from product where id_product = %s'
        cur.execute(query, (id_product,))
        conn.commit()
        cur.close()

        return jsonify({'message': 'product deleted!'}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@queries.route('/update_product/<int:id_product>', methods=['PUT'])
def update_product(id_product):
    try:
        data = request.json
        category_number = data.get('category_number')
        product_name = data.get('product_name')
        characteristics = data.get('characteristics')

        if not category_number or not product_name or not characteristics:
            return jsonify({'error': 'missing require fiekdl'}), 400

        conn = psycopg2.connect(SUPABASE_URL)
        cur = conn.cursor()

        query = '''
        update product
        set category_number = %s,
            product_name = %s,
            characteristics = %s
        where id_product = %s
        '''

        cur.execute(query, (category_number, product_name, characteristics, id_product))
        conn.commit()

        cur.close()

        return jsonify({'id': id_product, 'category_number': category_number, 'product_name': product_name, 'characteristics': characteristics}), 200

    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({'error': str(e)}), 500
