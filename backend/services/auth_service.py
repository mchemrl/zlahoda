from werkzeug.security import generate_password_hash

from backend.utils.db import get_connection


def fetch_user_by_username(username):
    with get_connection() as conn:
        with conn.cursor() as cur:
            get_user_query = '''
                select user_id, username, password
                from "user"
                where username = %s
            '''
            cur.execute(get_user_query, (username,))
            user = cur.fetchone()
    return user


def fetch_user_by_id(user_id):
    with get_connection() as conn:
        with conn.cursor() as cur:
            get_user_query = '''
                select user_id, username, password
                from "user"
                where user_id = %s
            '''
            cur.execute(get_user_query, (user_id,))
            user = cur.fetchone()
    return user


def fetch_employee_by_user_id(user_id):
    with get_connection() as conn:
        with conn.cursor() as cur:
            get_role_query = '''
                select empl_role, empl_surname, empl_name, empl_patronymic
                from employee
                where id_employee = %s
            '''
            cur.execute(get_role_query, (user_id,))
            employee = cur.fetchone()
    return employee


def create_user(employee_id, username, password):
    with get_connection() as conn:
        with conn.cursor() as cur:
            create_user_query = '''
                insert into "user" (user_id, username, password)
                values (%s, %s, %s)
            '''
            cur.execute(create_user_query, (employee_id, username, generate_password_hash(password)))
        conn.commit()
