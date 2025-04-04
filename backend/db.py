import os

import psycopg2
from dotenv import load_dotenv
from flask import g

load_dotenv()
SUPABASE_URL = os.getenv("SUPABASE_URL")


def get_connection():
    """Open a new database connection if there is none yet for the current application context."""
    if 'connection' not in g:
        g.conn = psycopg2.connect(SUPABASE_URL)
    return g.conn


def close_connection(e=None):
    """Close the database connection at the end of the request."""
    conn = g.pop('conn', None)
    if conn is not None:
        conn.close()
