from flask import Blueprint, jsonify, request

from backend.services.sales_service import fetch_sales, fetch_sale_by_id

sales = Blueprint('sales', __name__)


@sales.route('/', methods=('GET',))
def get_sales():
    receipt_id = request.args.get('receipt_id')
    if receipt_id is not None:
        sales_res = fetch_sale_by_id(receipt_id)
        if not sales_res:
            return jsonify({"error": "sale not found"}), 404
        return jsonify(sales_res), 200

    sales_res = fetch_sales()
    if not sales_res:
        return jsonify({"error": "no sales found"}), 404
    return jsonify(sales_res), 200
