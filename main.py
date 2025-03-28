from flask import send_from_directory

from backend import create_app

app = create_app()

if __name__ == '__main__':
    app.run(debug=True)
