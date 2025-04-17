from flask import Blueprint, request, jsonify

from backend.services.client_service import fetch_client
from backend.services.employees_service import fetch_employee_by_id
from backend.services.receipts_service import fetch_receipt_by_id, fetch_receipts, validate_receipt, create_receipt, \
    dump_receipt

receipts = Blueprint('receipts', __name__)


@receipts.route('/', methods=('GET',))
def get_receipts():
    receipt_id = request.args.get('receipt_id')
    if receipt_id is not None:
        receipt = fetch_receipt_by_id(receipt_id)
        if not receipt:
            return jsonify({"error": "receipt not found"}), 404
        return jsonify(receipt), 200

    cashier_id = request.args.get('cashier_id')
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    if cashier_id is not None:
        if start_date is not None and end_date is not None:
            receipts_res = fetch_receipts(start_date=start_date, end_date=end_date)
        else:
            receipts_res = fetch_receipts(cashier_id=cashier_id)
        return jsonify(receipts_res), 200

    receipts_res = fetch_receipts()
    return jsonify(receipts_res), 200


@receipts.route('/', methods=('POST',))
def add_receipt_sales():
    data = request.get_json()
    receipt = validate_receipt(data)
    if isinstance(receipt, tuple):
        return receipt  # error response from validate_receipt

    if receipt.get('card_number') is not None and fetch_client(receipt.get('card_number')) is None:
        return jsonify({"error": "client not found"}), 404

    if fetch_employee_by_id(receipt.get('id_employee')) is None:
        return jsonify({"error": "employee not found"}), 404

    create_receipt(receipt)
    return jsonify({"message": "receipt created successfully"}), 201


@receipts.route('/', methods=('DELETE',))
def delete_receipt():
    receipt_id = request.args.get('receipt_id')
    if receipt_id is None:
        return jsonify({"error": "receipt_id is required"}), 400

    receipt = fetch_receipt_by_id(receipt_id)
    if not receipt:
        return jsonify({"error": "receipt not found"}), 404

    dump_receipt(receipt_id)

    return jsonify({"message": "receipt deleted successfully"}), 200
