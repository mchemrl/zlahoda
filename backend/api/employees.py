import re

from flask import Blueprint, jsonify, request

from backend.services.employees_service import fetch_employees, fetch_employee_by_id, create_employee, edit_employee, \
    dump_employee

employees = Blueprint('employees', __name__)


@employees.route('/', methods=('GET',))
def get_employees():
    employee_id = request.args.get('employee_id')
    if employee_id:
        employees_res = fetch_employee_by_id(employee_id)
        if not employees_res:
            return jsonify({"error": "Employee not found"}), 404
        return jsonify(employees_res), 200

    employees_res = fetch_employees()
    return jsonify(employees_res), 200


@employees.route('/', methods=('POST',))
def add_employee():
    data = request.get_json()
    employee = (
        data.get('employee_id'),
        data.get('employee_name'),
        data.get('employee_surname'),
        data.get('employee_patronymic'),
        data.get('employee_role'),
        data.get('salary'),
        data.get('date_of_birth'),
        data.get('date_of_start'),
        data.get('phone_number'),
        data.get('city'),
        data.get('street'),
        data.get('zip_code')
    )

    if not all(employee):
        return jsonify({"error": "All fields are required"}), 400

    if not re.match(r'^\+[0-9]{12}$', employee[7]):
        return jsonify({'error': 'invalid phone number'}), 400

    if employee[4] <= 0:
        return jsonify({'error': 'invalid salary'}), 400

    result = create_employee(employee)
    if not result:
        return jsonify({"error": "Employee already exists"}), 400

    return jsonify({"message": "Employee created successfully"}), 201


@employees.route('/', methods=('PUT',))
def update_employee():
    data = request.get_json()
    employee_id = request.args.get('employee_id')
    if not employee_id:
        return jsonify({"error": "Employee ID is required"}), 400

    employee = (
        data.get('employee_name'),
        data.get('employee_surname'),
        data.get('employee_patronymic'),
        data.get('employee_role'),
        data.get('salary'),
        data.get('date_of_birth'),
        data.get('date_of_start'),
        data.get('phone_number'),
        data.get('city'),
        data.get('street'),
        data.get('zip_code'),
        employee_id
    )

    if not all(employee):
        return jsonify({"error": "All fields are required"}), 400

    if not re.match(r'^\+[0-9]{12}$', employee[7]):
        return jsonify({'error': 'invalid phone number'}), 400

    if employee[4] <= 0:
        return jsonify({'error': 'invalid salary'}), 400

    if not fetch_employee_by_id(employee_id):
        return jsonify({"error": "Employee not found"}), 404

    edit_employee(employee)
    return jsonify({"message": "Employee updated successfully"}), 200


@employees.route('/', methods=('DELETE',))
def delete_employee():
    employee_id = request.args.get('employee_id')
    if not employee_id:
        return jsonify({"error": "Employee ID is required"}), 400

    if not fetch_employee_by_id(employee_id):
        return jsonify({"error": "Employee not found"}), 404

    dump_employee(employee_id)
    return jsonify({"message": "Employee deleted successfully"}), 200