import psycopg2
from werkzeug.security import generate_password_hash

from backend.db import get_connection


def get_user(username):
    cur = get_connection().cursor()
    get_user_query = '''
            select user_id, username, password from "user" where username = %s
            '''
    cur.execute(get_user_query, (username,))
    user = cur.fetchone()
    cur.close()
    return user


def get_employee(user_id):
    cur = get_connection().cursor()
    get_role_query = '''
    select empl_role, empl_surname, empl_name, empl_patronymic from employee where id_employee = %s
    '''
    cur.execute(get_role_query, (user_id,))
    employee = cur.fetchone()
    cur.close()
    return employee


def add_user(employee, username, password):
    cur = get_connection().cursor()
    query = '''
                insert into "user" (user_id, username, password) values (%s, %s, %s) returning user_id
                '''
    cur.execute(query, (employee[0], username, generate_password_hash(password)))
    user_id = cur.fetchone()[0]
    get_connection().commit()
    cur.close()

    return user_id
