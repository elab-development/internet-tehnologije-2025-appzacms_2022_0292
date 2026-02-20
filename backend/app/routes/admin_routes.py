from flask import Blueprint
from app.controllers.admin_controller import set_user_role, overview, list_users

admin_bp = Blueprint("admin", __name__, url_prefix="/api/admin")

admin_bp.get("/overview")(overview)

admin_bp.get("/users")(list_users)

admin_bp.put("/users/<int:user_id>/role")(set_user_role)
