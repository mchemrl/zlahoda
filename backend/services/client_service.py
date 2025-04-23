from backend.utils.db import get_connection

def fetch_client(card_number):
    with get_connection() as conn:
        with conn.cursor() as cur:
            query = 'select * from customer_card where card_number = %s'
            cur.execute(query, (card_number,))
            client = cur.fetchone()

            if client:
                return {
                    'card_number': client[0],
                    'cust_surname': client[1],
                    'cust_name':client[2],
                    'cust_patronymic': client[3],
                    'phone_number': client[4],
                    'city':client[5],
                    'street': client[6],
                    'zip_code': client[7],
                    'percent': client[8],
                }
            else:
                return None

def fetch_clients(search = None, percent = None, descending=False):
    base_query = """
            select card_number, cust_surname, cust_name, cust_patronymic, phone_number, city, street, zip_code, percent
            from customer_card
        """

    conditions = list()
    parameters = list()

    if search is not None:
        conditions.append('cust_surname ilike %s')
        parameters.append(f"%{search}%")

    if percent is not None:
        conditions.append('percent = %s')
        parameters.append(percent)

    if conditions:
        base_query += ' where ' + ' and '.join(conditions)

    base_query += ' order by cust_surname'

    if descending:
        base_query += ' desc'

    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(base_query, tuple(parameters))
            clients = cur.fetchall()

    return [
        {
            'card_number': row[0],
            'cust_surname': row[1],
            'cust_name': row[2],
            'cust_patronymic': row[3],
            'phone_number': row[4],
            'city': row[5],
            'street': row[6],
            'zip_code': row[7],
            'percent': row[8]
        }
        for row in clients
    ]

def create_client(card_number, cust_surname, cust_name, cust_patronymic,
                    phone_number, city, street, zip_code, percent):
    with get_connection() as conn:
        with conn.cursor() as cur:
            query = """
                    insert into customer_card (card_number, cust_surname, cust_name, cust_patronymic, 
                    phone_number, city, street, zip_code, percent)
                    values (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                    """
            cur.execute(query, (card_number, cust_surname, cust_name, cust_patronymic,
                    phone_number, city, street, zip_code, percent))
            conn.commit()

def dump_client(card_number):
    with get_connection() as conn:
        with conn.cursor() as cur:
            query = 'delete from customer_card where card_number = %s'
            cur.execute(query, (card_number,))
            conn.commit()

def edit_client(card_number, cust_surname, cust_name, cust_patronymic,
                    phone_number, city, street, zip_code, percent):
    with get_connection() as conn:
        with conn.cursor() as cur:
            query = '''
                update customer_card 
                set cust_surname = %s,
                    cust_name = %s,
                    cust_patronymic = %s,
                    phone_number = %s,
                    city = %s,
                    street = %s,
                    zip_code = %s,
                    percent = %s
                where card_number = %s
            '''
            cur.execute(query, (cust_surname, cust_name, cust_patronymic,
                    phone_number, city, street, zip_code, percent, card_number))
            conn.commit()