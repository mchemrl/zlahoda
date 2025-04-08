import functools

from flask import jsonify, g


def login_required(view):
    @functools.wraps(view)
    def wrapped_view(**kwargs):
        if g.user is None:
            return jsonify({'error': 'not logged in'}), 400
        return view(**kwargs)

    return wrapped_view


def manager_required(view):
    @functools.wraps(view)
    def wrapped_view(**kwargs):
        if g.user is None:
            return jsonify({'error': 'not logged in'}), 400
        if g.employee is None or g.employee[0] != 'Manager':
            return jsonify({'error': 'not manager'}), 400
        return view(**kwargs)

    return wrapped_view


def cashier_required(view):
    @functools.wraps(view)
    def wrapped_view(**kwargs):
        if g.user is None:
            return jsonify({'error': 'not logged in'}), 400
        if g.employee is None or g.employee[0] != 'Cashier':
            return jsonify({'error': 'not cashier'}), 400
        return view(**kwargs)

    return wrapped_view
