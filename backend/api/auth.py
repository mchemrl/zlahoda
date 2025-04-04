from flask import Blueprint, request, session, g, jsonify
from psycopg2 import IntegrityError
from werkzeug.security import check_password_hash

from backend.db import get_connection
from backend.decorators import manager_required
from backend.services.auth_service import get_user, get_employee, add_user

auth = Blueprint('auth', __name__)


@auth.route('/register', methods=('POST',))
@manager_required
def register():
    data = request.json
    employee = data.get('employee')
    username = data.get('username')
    password = data.get('password')

    if not username:
        return jsonify({'error': 'username is required'}), 400
    elif not password:
        return jsonify({'error': 'password is required'}), 400

    try:
        add_user(employee, username, password)
    except IntegrityError:
        return jsonify({'error': 'username already exists'}), 400

    return jsonify({'message': 'user created successfully'}), 201


@auth.route('/login', methods=('GET',))
def get_login():
    if g.user is None:
        return jsonify({'error': 'not logged in'}), 400

    user_id = session.get('user_id')
    employee = get_employee(user_id)
    return jsonify({
        'user_id': user_id,
        'role': employee[0],
        'empl_surname': employee[1],
        'empl_name': employee[2],
        'empl_patronymic': employee[3]}), 200


@auth.route('/login', methods=('POST',))
def login():
    if request.method == 'POST':
        if g.user is not None:
            return jsonify({'error': 'already logged in'}), 400

        data = request.json
        username = data.get('username')
        password = data.get('password')

        if not username:
            return jsonify({'error': 'username is required'}), 400
        elif not password:
            return jsonify({'error': 'password is required'}), 400

        user = get_user(username)

        if user is None or not check_password_hash(user[2], password):
            return jsonify({'error': 'incorrect username or password'}), 400

        employee = get_employee(user[0])

        session.clear()
        session['user_id'] = user[0]
        session['role'] = employee[0] if employee[0] else None
        return jsonify({
            'user_id': user[0],
            'role': employee[0],
            'empl_surname': employee[1],
            'empl_name': employee[2],
            'empl_patronymic': employee[3]}), 200


@auth.before_app_request
def load_logged_in_user():
    user_id = session.get('user_id')

    if user_id is None:
        g.user = None
    else:
        cur = get_connection().cursor()
        query = '''
        SELECT * FROM "user" WHERE user_id = %s
        '''
        cur.execute(query, (user_id,))
        g.user = cur.fetchone()
        cur.close()


@auth.route('/logout', methods=('POST',))
def logout():
    session.clear()
    return jsonify({'message': 'logged out successfully'}), 200
