import os

import psycopg2
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("supabase_url")


def open_connection():
    """Open a connection to the database."""
    return psycopg2.connect(SUPABASE_URL)
