from functools import wraps
from flask import jsonify
from flask_login import current_user
from app.models import UserRole

def login_required_json(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        if not current_user.is_authenticated:
            return jsonify({"error": "Unauthorized"}), 401
        return fn(*args, **kwargs)
    return wrapper

def admin_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        if not current_user.is_authenticated:
            return jsonify({"error": "Unauthorized"}), 401
        if current_user.role != UserRole.ADMIN:
            return jsonify({"error": "Forbidden"}), 403
        return fn(*args, **kwargs)
    return wrapper

def owner_or_admin(get_owner_id):
    """
    get_owner_id: funkcija koja prima (obj) i vraća owner user id
    """
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            if not current_user.is_authenticated:
                return jsonify({"error": "Unauthorized"}), 401
            obj = kwargs.get("obj")
            if obj is None:
                return jsonify({"error": "Server misconfig: obj missing"}), 500
            if current_user.role == UserRole.ADMIN:
                return fn(*args, **kwargs)
            if current_user.id != get_owner_id(obj):
                return jsonify({"error": "Forbidden"}), 403
            return fn(*args, **kwargs)
        return wrapper
    return decorator
