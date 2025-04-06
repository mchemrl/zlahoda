from backend.db import get_connection


def fetch_categories():
    with get_connection() as conn:
        with conn.cursor() as cur:
            query = '''
                select category_number, category_name
                from category
            '''
            cur.execute(query)
            categories = cur.fetchall()
        return categories


def fetch_category_by_id(category_id):
    with get_connection() as conn:
        with conn.cursor() as cur:
            query = '''
                select category_number, category_name
                from category
                where category_number = %s
            '''
            cur.execute(query, (category_id,))
            category = cur.fetchone()
        return category


def create_category(category_id, category_name):
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT * FROM category WHERE category_number = %s", (category_id,))
            if cur.fetchone() is not None:
                return False

            query = '''
                INSERT INTO category (category_number, category_name)
                VALUES (%s, %s)
            '''
            cur.execute(query, (category_id, category_name))
            conn.commit()

    return True


def edit_category(category_id, category_name):
    with get_connection() as conn:
        with conn.cursor() as cur:
            query = '''
                update category
                set category_name = %s
                where category_number = %s
            '''
            cur.execute(query, (category_name, category_id))
            conn.commit()


def dump_category(category_id):
    with get_connection() as conn:
        with conn.cursor() as cur:
            query = '''
                delete from category
                where category_number = %s
            '''
            cur.execute(query, (category_id,))
            conn.commit()
