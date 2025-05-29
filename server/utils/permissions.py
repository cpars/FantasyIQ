from functools import wraps
from flask_jwt_extended import get_jwt_identity
from flask import jsonify
from models.user import User

def admin_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        user_id = get_jwt_identity()
        user = User.query.get(user_id)

        if not user or not user.is_admin:
            return jsonify({"error": "Admin access required"}), 403

        return fn(*args, **kwargs)
    return wrapper
