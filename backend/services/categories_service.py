from backend.utils.db import get_connection


def fetch_categories(sort_by=None, is_ascending=None):
    base_query = '''
        select category_number, category_name
        from category
    '''
    if sort_by is not None and is_ascending is not None:
        direction = 'asc' if is_ascending else 'desc'
        base_query += f' order by {sort_by} {direction}'

    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(base_query)
            categories = cur.fetchall()
            if categories:
                return [
                    {
                        "id": category[0],
                        "category_name": category[1]
                    }
                    for category in categories
                ]
            else:
                return None



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
            query = '''
                INSERT INTO category (category_number, category_name)
                VALUES (%s, %s)
            '''
            cur.execute(query, (category_id, category_name))
            conn.commit()


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
