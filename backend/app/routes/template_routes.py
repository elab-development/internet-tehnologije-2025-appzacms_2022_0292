from flask import Blueprint
from app.controllers.template_controller import (
    list_templates, get_template, create_template, update_template, delete_template
)

template_bp = Blueprint("templates", __name__, url_prefix="/api/templates")

template_bp.get("")(list_templates)
template_bp.get("/<int:template_id>")(get_template)
template_bp.post("")(create_template)
template_bp.put("/<int:template_id>")(update_template)
template_bp.delete("/<int:template_id>")(delete_template)
