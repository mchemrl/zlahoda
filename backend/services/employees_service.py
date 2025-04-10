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
                insert into employee (id_employee, empl_name, empl_surname, empl_patronymic, empl_role,
                                      salary, date_of_birth, date_of_start, phone_number, city, street, zip_code)
                values (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            '''
            cur.execute(query, employee[:])
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
            cur.execute(query, employee[0:12])
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
