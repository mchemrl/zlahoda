from flask import send_from_directory
from werkzeug.security import generate_password_hash

from backend import create_app, queries
from flask_cors import CORS

print(f'password: {generate_password_hash("vikakrinzh")}')

app = create_app()

if __name__ == '__main__':
    app.run(debug=True)

# CORS(app)
#
# app.register_blueprint(queries)