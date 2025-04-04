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
