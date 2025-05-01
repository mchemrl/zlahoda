import os

import psycopg2
from dotenv import load_dotenv
from contextlib import contextmanager

load_dotenv()
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv('SUPABASE_KEY')

@contextmanager
def get_connection():
    conn = None
    try:
        conn = psycopg2.connect(SUPABASE_URL)
        yield conn
    except Exception as e:
        yield None
    finally:
        if conn:
            conn.close()
