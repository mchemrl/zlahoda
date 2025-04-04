from backend.db import get_connection


def fetch_categories():
    cur = get_connection().cursor()
    query = '''
                select category_number, category_name
                from category
            '''
    cur.execute(query)
    categories = cur.fetchall()
    cur.close()

    return categories


def fetch_category_by_id(category_id):
    cur = get_connection().cursor()
    query = '''
                select category_number, category_name
                from category
                where category_number = %s
            '''
    cur.execute(query, (category_id,))
    category = cur.fetchone()
    cur.close()

    return category


def edit_category(category_id, category_name):
    cur = get_connection().cursor()
    query = '''
                update category
                set category_name = %s
                where category_number = %s
            '''
    cur.execute(query, (category_name, category_id))
    get_connection().commit()
    cur.close()
