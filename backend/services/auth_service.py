import psycopg2
from werkzeug.security import generate_password_hash

from backend.db import get_connection


def get_user(username):
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


def get_employee(user_id):
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


def add_user(employee, username, password):
    with get_connection() as conn:
        with conn.cursor() as cur:
            query = '''
                insert into "user" (user_id, username, password)
                values (%s, %s, %s)
                returning user_id
            '''
            cur.execute(query, (employee[0], username, generate_password_hash(password)))
            user_id = cur.fetchone()[0]
        conn.commit()
    return user_id
