import psycopg2
from flask import Blueprint, render_template, jsonify

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
