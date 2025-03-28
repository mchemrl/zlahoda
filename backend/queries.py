import psycopg2
from flask import Blueprint, render_template, jsonify, request

from backend import SUPABASE_URL

queries = Blueprint('queries', __name__)


@queries.route('/get_categories', methods=['GET'])
def get_categories():
    try:
        conn = psycopg2.connect(SUPABASE_URL)
        cur = conn.cursor()

        cur.execute("SELECT * FROM Category;")
        categories = cur.fetchall()
        category_list = []
        for row in categories:
            category_list.append({
                "id": row[0],
                "category_name": row[1]
            })

        cur.close()
        conn.close()

        return jsonify(category_list)

    except Exception as e:
        return jsonify({"error": str(e)})


@queries.route('/get_products', methods=['GET'])
def get_products():
    try:
        conn = psycopg2.connect(SUPABASE_URL)
        cur = conn.cursor()

        cur.execute("SELECT * FROM Product;")
        products = cur.fetchall()
        product_list = []
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
        return jsonify({"error": str(e)})

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

        if not id_product or not UPC or not selling_price or not products_number:
            return jsonify({"error": "Missing required fields"}), 400

        conn = psycopg2.connect(SUPABASE_URL)
        cur = conn.cursor()

        query = """
               INSERT INTO store_product (UPC, UPC_prom, id_product, selling_price, products_number, promotional_product)
               VALUES (%s, %s, %s, %s, %s, %s)
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

        return jsonify({"message": "Product added successfully!"}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500
