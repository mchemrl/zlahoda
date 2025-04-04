from flask import Blueprint, jsonify

from backend.db import get_connection
from backend.services.categories_service import get_all_categories

categories = Blueprint('categories', __name__)


@categories.route('/categories', methods=('GET',))
def get_categories():
    categories_query_res = get_all_categories()
    category_list = list()
    for row in categories_query_res:
        category_list.append({
            "id": row[0],
            "category_name": row[1]
        })

    return jsonify(category_list)
