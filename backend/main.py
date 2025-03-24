import psycopg2
import os
from flask import Flask, render_template, jsonify
from dotenv import load_dotenv
from flask_cors import CORS

load_dotenv()
app = Flask(__name__,
            template_folder='../frontend/templates',
            static_folder='../frontend/static')
CORS(app)
SUPABASE_URL = os.getenv("supabase_url")

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/get_products', methods=['GET'])
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

if __name__ == '__main__':
    app.run(debug=True)
