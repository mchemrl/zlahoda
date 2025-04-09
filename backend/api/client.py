import re

from flask import Blueprint, jsonify, request, session

from ..decorators import manager_required, cashier_required
from ..services.client_service import edit_client, dump_client, create_client, fetch_client, fetch_clients

client = Blueprint('client', __name__)

@client.route('/', methods=('GET',))
def get_clients():
    if session.get('role') == 'Cashier':
        search = request.args.get('search')
    if session.get('role') == 'Manager':
        percent = request.args.get('percent')
    # search = request.args.get('search')
    # percent = request.args.get('percent')
    descending = request.args.get('descending')

    clients = fetch_clients(search, percent, descending)
    return jsonify(clients)

@client.route('/', methods=('POST',))
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

    if not re.match(r'^\+[0-9]{12}$', phone_number):
        return jsonify({'error': 'invalid phone number'}), 400

    create_client(card_number, cust_surname, cust_name, cust_patronymic,
                  phone_number, city, street, zip_code, percent);
    return jsonify({'message': 'client added!'}), 200

@client.route('/', methods=('PUT',))
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

    if not re.match(r'^\+[0-9]{12}$', phone_number):
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
@manager_required
def delete_client():
    card_number = request.args.get('card_number')
    if not card_number:
        return jsonify({'error': 'missing card_number'}), 400

    client = fetch_client(card_number)
    if not client:
        return jsonify({'error': 'client not found'}), 404

    dump_client(card_number)
    return jsonify({'message': 'client deleted!'}), 200