import functools

import psycopg2
from flask import Blueprint, request, jsonify, redirect, url_for, flash, render_template, session, g
from werkzeug.security import generate_password_hash, check_password_hash

from backend import SUPABASE_URL

auth = Blueprint('auth', __name__)

@auth.route('/register', methods=('GET', 'POST'))
def register():
    if request.method == 'POST':
        data = request.json
        username = data.get('username')
        password = data.get('password')
        error = None

        if not username:
            error = 'username is required'
        elif not password:
            error = 'password is required'

        if error is not None:
            try:
                conn = psycopg2.connect(SUPABASE_URL)
                cur = conn.cursor()

                cur.execute('INSERT INTO user (username, password) VALUES (%s, %s)',
                            (username, generate_password_hash(password)))

                conn.commit()
                cur.close()
                conn.close()

            except psycopg2.IntegrityError:
                error = f'User {username} is already registered'
            except Exception as e:
                error = f'Exception: {str(e)}'
            else:
                return redirect(url_for('smth'))

        flash(error)  # я хз як тут краще, бо якщо return jsonify, то помилка коли вже є зареєстрований юзер не пройде

    return render_template('register.html')


@auth.route('/login', methods=('GET', 'POST'))
def login():
    if request.method == 'POST':
        data = request.json
        username = data.get('username')
        password = data.get('password')
        error = None

        if not username:
            error = 'username is required'
        elif not password:
            error = 'password is required'

        if error is not None:
            try:
                conn = psycopg2.connect(SUPABASE_URL)
                cur = conn.cursor()

                cur.execute('SELECT * FROM user WHERE username = %s', (username,))
                user = cur.fetchone()

                if user is None:
                    error = 'there is no such a user'
                elif not check_password_hash(user[2], password):
                    error = 'incorrect password'

                if error is None:
                    session.clear()
                    session['user_id'] = user[0]
                    return redirect(url_for('index'))

            except Exception as e:
                error = f'Exception: {str(e)}'

        flash(error)

    return render_template('login.html')


@auth.before_app_request
def load_logged_in_user():
    user_id = session.get('user_id')

    if user_id is None:
        g.user = None
    else:
        conn = psycopg2.connect(SUPABASE_URL)
        cur = conn.cursor()

        cur.execute('SELECT * FROM user WHERE id = %s', (user_id,))
        g.user = cur.fetchone()


@auth.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('smth'))


def login_required(view):
    @functools.wraps(view)
    def wrapped_view(**kwargs):
        if g.user is None:
            return redirect(url_for('index'))
        return view(**kwargs)

    return wrapped_view
