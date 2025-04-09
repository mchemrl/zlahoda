from flask import Blueprint, request, session, g, jsonify
from psycopg2 import IntegrityError
from werkzeug.security import check_password_hash

from backend.decorators import manager_required
from backend.services.auth_service import fetch_user_by_username, fetch_employee_by_user_id, create_user, \
    fetch_user_by_id
from backend.services.employees_service import fetch_employee_by_id

auth = Blueprint('auth', __name__)


@auth.route('/register', methods=['POST'])
@manager_required
def register():
    data = request.json
    empl_id = data.get('employee_id')
    username = data.get('username')
    password = data.get('password')

    if not fetch_employee_by_id(empl_id):
        return jsonify({'error': 'employee not found'}), 400

    if not username:
        return jsonify({'error': 'username is required'}), 400
    elif not password:
        return jsonify({'error': 'password is required'}), 400

    try:
        create_user(empl_id, username, password)
    except IntegrityError:
        return jsonify({'error': 'username already exists'}), 400

    return jsonify({'message': 'user created successfully'}), 201


@auth.route('/login', methods=['GET'])
def get_login():
    if g.user is None:
        return jsonify({'error': 'not logged in'}), 400

    user_id = session.get('user_id')
    employee = fetch_employee_by_user_id(user_id)
    return jsonify({
        'user_id': user_id,
        'role': employee[0],
        'empl_surname': employee[1],
        'empl_name': employee[2],
        'empl_patronymic': employee[3]
    }), 200


@auth.route('/login', methods=['POST'])
def login():
    if g.user is not None:
        return jsonify({'error': 'already logged in'}), 400

    data = request.json
    username = data.get('username')
    password = data.get('password')

    if not username:
        return jsonify({'error': 'username is required'}), 400
    elif not password:
        return jsonify({'error': 'password is required'}), 400

    user = fetch_user_by_username(username)
    if user is None or not check_password_hash(user[2], password):
        return jsonify({'error': 'incorrect username or password'}), 400

    employee = fetch_employee_by_user_id(user[0])
    session.clear()
    session['user_id'] = user[0]
    session['role'] = employee[0] if employee[0] else None
    session.permanent = False
    return jsonify({
        'user_id': user[0],
        'role': employee[0],
        'empl_surname': employee[1],
        'empl_name': employee[2],
        'empl_patronymic': employee[3]
    }), 200


@auth.before_app_request
def load_logged_in_user():
    user_id = session.get('user_id')
    if user_id is None:
        g.user = None
        return

    g.user = fetch_user_by_id(user_id)
    g.employee = fetch_employee_by_user_id(user_id)


@auth.route('/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({'message': 'logged out successfully'}), 200
