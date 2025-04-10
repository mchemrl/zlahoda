import re
from datetime import datetime

from flask import jsonify

from backend.db import get_connection


def fetch_employees(sort_by=None, is_ascending=None, role=None, search_by=None, search_value=None):
    query = '''select * from employee'''
    clauses = []
    params = []

    if role is not None:
        clauses.append(f'empl_role = %s')
        params.append(role)

    if search_by is not None and search_value is not None:
        clauses.append(f"{search_by} ilike %s")
        params.append(f"%{search_value}%")

    if clauses:
        query += ' where ' + ' and '.join(clauses)

    if sort_by is not None and is_ascending is not None:
        direction = 'asc' if is_ascending else 'desc'
        query += f' order by {sort_by} {direction}'

    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(query, params)
            employees = cur.fetchall()
            return [
                {
                    "id_employee": row[0],
                    "empl_name": row[1],
                    "empl_surname": row[2],
                    "empl_patronymic": row[3],
                    "empl_role": row[4],
                    "salary": row[5],
                    "date_of_birth": row[6],
                    "date_of_start": row[7],
                    "phone_number": row[8],
                    "city": row[9],
                    "street": row[10],
                    "zip_code": row[11]
                }
                for row in employees
            ]


def fetch_employee_by_id(employee_id):
    with get_connection() as conn:
        with conn.cursor() as cur:
            query = '''
                select * from employee
                where id_employee = %s
            '''
            cur.execute(query, (employee_id,))
            employee = cur.fetchone()

            if not employee:
                return None

            return {
                "id_employee": employee[0],
                "empl_name": employee[1],
                "empl_surname": employee[2],
                "empl_patronymic": employee[3],
                "empl_role": employee[4],
                "salary": employee[5],
                "date_of_birth": employee[6],
                "date_of_start": employee[7],
                "phone_number": employee[8],
                "city": employee[9],
                "street": employee[10],
                "zip_code": employee[11]
            }


def create_employee(employee):
    with get_connection() as conn:
        with conn.cursor() as cur:
            query = '''
                insert into employee (
                id_employee,
                empl_name,
                empl_surname,
                empl_patronymic,
                empl_role,
                salary,
                date_of_birth,
                date_of_start,
                phone_number,
                city, street,
                zip_code)
                values (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            '''
            cur.execute(query, employee)
            conn.commit()


def edit_employee(employee):
    with get_connection() as conn:
        with conn.cursor() as cur:
            query = '''
                update employee
                set empl_name = %s,
                    empl_surname = %s,
                    empl_patronymic = %s,
                    empl_role = %s,
                    salary = %s,
                    date_of_birth = %s,
                    date_of_start = %s,
                    phone_number = %s,
                    city = %s,
                    street = %s,
                    zip_code = %s
                where id_employee = %s
            '''
            cur.execute(query, employee[1:12] + (employee[0],))
            conn.commit()


def dump_employee(employee_id):
    with get_connection() as conn:
        with conn.cursor() as cur:
            query = '''
                delete from employee
                where id_employee = %s
            '''
            cur.execute(query, (employee_id,))
            conn.commit()


def validate_employee(data, employee_id=None):
    employee = {
        "id_employee": data.get('employee_id') if employee_id is None else employee_id,
        "empl_name": data.get('employee_name'),
        "empl_surname": data.get('employee_surname'),
        "empl_patronymic": data.get('employee_patronymic'),
        "empl_role": data.get('employee_role'),
        "salary": data.get('salary'),
        "date_of_birth": data.get('date_of_birth'),
        "date_of_start": data.get('date_of_start'),
        "phone_number": data.get('phone_number'),
        "city": data.get('city'),
        "street": data.get('street'),
        "zip_code": data.get('zip_code')
    }

    if not all(employee.values()):
        return jsonify({"error": "all fields are required"}), 400

    if employee.get('empl_role') not in ('Manager', 'Cashier'):
        return jsonify({"error": "invalid role"}), 400

    try:
        salary = int(employee.get('salary'))
    except (ValueError, TypeError):
        return jsonify({"error": "invalid salary type"}), 400
    if salary <= 0:
        return jsonify({'error': 'salary cannot be negative'}), 400
    employee['salary'] = salary

    try:
        date_of_birth = datetime.strptime(data.get('date_of_birth'), "%Y-%m-%d").date()
        date_of_start = datetime.strptime(data.get('date_of_start'), "%Y-%m-%d").date()
    except (ValueError, TypeError):
        return jsonify({"error": "Invalid date format. Expected YYYY-MM-DD"}), 400

    today = datetime.today().date()
    min_birth_date = today.replace(year=today.year - 18)
    if date_of_start > today:
        return jsonify({"error": "employee cannot start in the future"}), 400
    if date_of_birth > today:
        return jsonify({"error": "employee cannot be born in the future"}), 400
    if date_of_birth > min_birth_date:
        return jsonify({"error": "employee must be at least 18 years old"}), 400

    employee['date_of_birth'] = date_of_birth
    employee['date_of_start'] = date_of_start

    if not re.match(r'^\+[0-9]{12}$', employee.get('phone_number')):
        return jsonify({'error': 'invalid phone number'}), 400

    return tuple(employee.values())