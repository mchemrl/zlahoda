from flask import Blueprint, jsonify, request

from ..decorators import manager_required, cashier_required
from ..services.client_service import edit_client, dump_client, create_client, fetch_client

client = Blueprint('client', __name__)

@client.route('/', methods=('GET',))
def get_client():
    pass

@client.route('/', methods=('GET',))
def get_clients():
    pass

@client.route('/', methods=('POST',))
@cashier_required
def add_client():
    data = request.json;
    card_number = data.get('card_number')
    cust_surname = data.get('cust_surname')
    cust_name = data.get('cust_name')
    cust_patronymic = data.get('cust_patronymic')
    phone_number = data.get('phone_number')
    city = data.get('city')
    street = data.get('street')
    zip_code = data.get('zip_code')
    percent = int(data.get('percent'))

    if not card_number or not cust_name or not cust_surname or not phone_number or not percent:
        return jsonify({'error': 'missing required fields'}), 400

    if percent <= 0 or percent > 100:
        return jsonify({'error': 'invalid percent'}), 400

    if len(phone_number) > 13 or not phone_number.startswith('+'):
        return jsonify({'error': 'invalid phone number'}), 400

    create_client(card_number, cust_surname, cust_name, cust_patronymic,
                  phone_number, city, street, zip_code, percent);
    return jsonify({'message': 'client added!'}), 200


@client.route('/', methods=('PUT',))
@cashier_required
def update_client():
    card_number = request.args.get('card_number', type=str)
    if not card_number:
        return jsonify({'error': 'missing card_number'}), 400

    client = fetch_client(card_number)
    if not client:
        return jsonify({'error': 'client not found'}), 404

    data = request.json;
    card_number = data.get('card_number')
    cust_surname = data.get('cust_surname')
    cust_name = data.get('cust_name')
    cust_patronymic = data.get('cust_patronymic')
    phone_number = data.get('phone_number')
    city = data.get('city')
    street = data.get('street')
    zip_code = data.get('zip_code')
    percent = int(data.get('percent'))

    if not card_number or not cust_name or not cust_surname or not phone_number or not percent:
        return jsonify({'error': 'missing required fields'}), 400

    if percent <= 0 or percent > 100:
        return jsonify({'error': 'invalid percent'}), 400

    if len(phone_number) > 13 or not phone_number.startswith('+'):
        return jsonify({'error': 'invalid phone number'}), 400

    edit_client(card_number, cust_surname, cust_name, cust_patronymic,phone_number, city, street, zip_code, percent)

    return jsonify({
        'card_number': card_number,
        'cust_surname': cust_surname,
        'cust_name': cust_name,
        'cust_patronymic': cust_patronymic,
        'phone_number': phone_number,
        'city': city,
        'street': street,
        'zip_code': zip_code,
        'percent': percent
    }), 200

@client.route('/', methods=('DELETE',))
#@manager_required
def delete_client():
    card_number = request.args.get('card_number')
    if not card_number:
        return jsonify({'error': 'missing card_number'}), 400

    client = fetch_client(card_number)
    if not client:
        return jsonify({'error': 'client not found'}), 404

    dump_client(card_number)
    return jsonify({'message': 'client deleted!'}), 200