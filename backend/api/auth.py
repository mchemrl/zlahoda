import functools

from flask import Blueprint, request, session, g, jsonify
from werkzeug.security import check_password_hash

from backend.db import get_connection
from backend.services.auth_service import get_user, get_employee

auth = Blueprint('auth', __name__)


# @auth.route('/register', methods=('POST',))
# def register():
#     data = request.json
#     username = data.get('username')
#     password = data.get('password')
#
#     if not username:
#         return jsonify({'error': 'username is required'}), 400
#     elif not password:
#         return jsonify({'error': 'password is required'}), 400
#
#     conn = open_connection()
#     cur = conn.cursor()
#     try:
#         query = '''
#             insert into "user" (username, password) values (%s, %s) returning user_id
#             '''
#         cur.execute(query, (username, generate_password_hash(password)))
#         user_id = cur.fetchone()[0]
#         conn.commit()
#     except psycopg2.IntegrityError:
#         return jsonify({'error': 'username already exists'}), 400
#     finally:
#         cur.close()
#         conn.close()
#     session['user_id'] = user_id
#     return jsonify({'message': 'user created successfully'}), 201

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

        cur.execute('''
        SELECT * FROM employee WHERE id_employee = %s
        ''', (user_id,))
        g.user = cur.fetchone()

        cur.close()


@auth.route('/logout', methods=('POST',))
def logout():
    session.clear()
    return jsonify({'message': 'logged out successfully'}), 200


def login_required(view):
    @functools.wraps(view)
    def wrapped_view(**kwargs):
        if g.user is None:
            return jsonify({'error': 'not logged in'}), 400
        return view(**kwargs)

    return wrapped_view


def manager_required(view):
    @functools.wraps(view)
    def wrapped_view(**kwargs):
        if g.user is None or g.user[0] != 'Manager':
            return jsonify({'error': 'not manager'}), 400
        return view(**kwargs)

    return wrapped_view


def cashier_required(view):
    @functools.wraps(view)
    def wrapped_view(**kwargs):
        if g.user is None or g.user[0] != 'Cashier':
            return jsonify({'error': 'not cashier'}), 400
        return view(**kwargs)

    return wrapped_view
