from flask import Blueprint, jsonify, request, session
from backend.services.employees_service import fetch_employees, fetch_employee_by_id, create_employee, edit_employee, \
    dump_employee, validate_employee

employees = Blueprint('employees', __name__)


@employees.route('/me', methods=('GET',))
def get_me():
    my_employee_id = session.get('user_id')
    if not my_employee_id:
        return jsonify({"error": "not logged in"}), 401
    employees_res = fetch_employee_by_id(my_employee_id)
    if not employees_res:
        return jsonify({"error": "Employee not found"}), 404
    return jsonify(employees_res)


@employees.route('/', methods=('GET',))
def get_employees():
    employee_id = request.args.get('employee_id', type=str)
    if employee_id:
        employees_res = fetch_employee_by_id(employee_id)
        if not employees_res:
            return jsonify({"error": "Employee not found"}), 404
        return jsonify(employees_res), 200

    categories = (
        'id_employee', 'empl_name', 'empl_surname', 'empl_patronymic',
        'empl_role', 'salary', 'date_of_birth', 'date_of_start',
        'phone_number', 'city', 'street', 'zip_code'
    )

    search_by = request.args.get('search_by', type=str)
    search_value = request.args.get('search_value', type=str)
    if search_by is not None and search_value is not None:
        if search_by not in categories:
            return jsonify({"error": "invalid search category"}), 400

    sort_by = request.args.get('sort_by', type=str)
    is_ascending = request.args.get('is_ascending', type=int)
    role = request.args.get('role', type=str)
    if sort_by is not None and is_ascending is not None:
        if sort_by in categories:
            is_ascending = bool(is_ascending)
        else:
            return jsonify({"error": "invalid sort category"}), 400

    if role is not None:
        if role not in ('Manager', 'Cashier'):
            return jsonify({"error": "invalid role"}), 400

    employees_res = fetch_employees(sort_by, is_ascending, role, search_by, search_value)
    return jsonify(employees_res), 200


@employees.route('/', methods=('POST',))
def add_employee():
    employee = validate_employee(request.get_json())

    if fetch_employee_by_id(employee[0]) is not None:
        return jsonify({"error": "employee already exists"}), 400

    create_employee(employee)

    return jsonify({"message": "employee created successfully"}), 201


@employees.route('/', methods=('PUT',))
def update_employee():
    employee_id = request.args.get('employee_id', type=str)
    if not employee_id:
        return jsonify({"error": "employee ID is required"}), 400

    if not fetch_employee_by_id(employee_id):
        return jsonify({"error": "employee not found"}), 404

    employee = validate_employee(request.get_json(), employee_id)

    edit_employee(employee)
    return jsonify({"message": "employee updated successfully"}), 200


@employees.route('/', methods=('DELETE',))
def delete_employee():
    employee_id = request.args.get('employee_id', type=str)
    if not employee_id:
        return jsonify({"error": "employee ID is required"}), 400

    if not fetch_employee_by_id(employee_id):
        return jsonify({"error": "employee not found"}), 404

    dump_employee(employee_id)
    return jsonify({"message": "employee deleted successfully"}), 200
