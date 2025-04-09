from flask import Blueprint, jsonify, request

from ..decorators import manager_required, cashier_required
from ..services.client_service import edit_client, dump_client, create_client

client = Blueprint('client', __name__)

# @client.route('/', methods=('GET',))
# def get_client():
#     pass

@client.route('/', methods=('GET',))
def get_clients():
    pass

@client.route('/', methods=('POST',))
@cashier_required
def add_client():
    pass

@client.route('/', methods=('PUT',))
@cashier_required
def update_client():
    pass

@client.route('/', methods=('DELETE',))
@manager_required
def delete_client():
    pass