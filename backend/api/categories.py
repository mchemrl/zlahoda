from flask import Blueprint, jsonify, request
from psycopg2 import IntegrityError

from backend.services.categories_service import fetch_categories, fetch_category_by_id, create_category, edit_category, \
    dump_category
from backend.utils.decorators import manager_required

categories = Blueprint('categories', __name__)


@categories.route('/', methods=('GET',))
def get_categories():
    category_id = request.args.get('category_id', type=str)
    if category_id is not None:
        category = fetch_category_by_id(category_id)
        if not category:
            return jsonify({"error": "category not found"}), 404
        return jsonify({
            "id": category[0],
            "category_name": category[1]
        })

    sort_by = request.args.get('sort_by', type=str)
    is_ascending = request.args.get('is_ascending', type=int) # expected to be 0, 1 or None
    if sort_by is not None and is_ascending is not None:
        if sort_by in ['category_number', 'category_name']:
            is_ascending = bool(is_ascending)
        else:
            return jsonify({"error": "invalid sort category"}), 400

    categories_query_res = fetch_categories(sort_by, is_ascending)
    category_list = list()
    for row in categories_query_res:
        category_list.append({
            "id": row[0],
            "category_name": row[1]
        })
    return jsonify(category_list)


@categories.route('/', methods=('POST',))
@manager_required
def add_category():
    data = request.get_json()
    category_id = data.get('category_id')
    category_name = data.get('category_name')

    if not category_name:
        return jsonify({"error": "category name is required"}), 400
    if fetch_category_by_id(category_id) is not None:
        return jsonify({"error": "Category with this ID already exists"}), 400

    create_category(category_id, category_name)

    return jsonify({"message": "category created successfully"}), 201


@categories.route('/', methods=('PUT',))
@manager_required
def update_category():
    category_id = request.args.get('category_id', type=int)
    if not category_id:
        return jsonify({"error": "category id is required"}), 400

    category = fetch_category_by_id(category_id)
    if not category:
        return jsonify({"error": "category not found"}), 404

    category_name = request.get_json().get('category_name')

    if not category_name:
        return jsonify({"error": "category name is required"}), 400

    edit_category(category_id, category_name)

    return jsonify({"message": "category updated successfully"}), 200

@categories.route('/', methods=('DELETE',))
@manager_required
def delete_category():
    category_id = request.args.get('category_id', type=int)
    if not category_id:
        return jsonify({"error": "category id is required"}), 400

    category = fetch_category_by_id(category_id)
    if not category:
        return jsonify({"error": "category not found"}), 404

    try:
        dump_category(category_id)
    except IntegrityError as e:
        if 'foreign key constraint' in str(e).lower():
            return jsonify({"error": "cannot delete category because it has associated products"}), 400
        else:
            return jsonify({"error": "database error: " + str(e)}), 500

    return jsonify({"message": "category deleted successfully"}), 200