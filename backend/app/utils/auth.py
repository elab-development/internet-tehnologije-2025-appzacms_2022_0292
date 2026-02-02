from functools import wraps
from flask import jsonify
from flask_login import current_user
from app.models import UserRole

def admin_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        if not current_user.is_authenticated:
            return jsonify({"error": "Unauthorized"}), 401
        if current_user.role != UserRole.ADMIN:
            return jsonify({"error": "Forbidden"}), 403
        return fn(*args, **kwargs)
    return wrapper