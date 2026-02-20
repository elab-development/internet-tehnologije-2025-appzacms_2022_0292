from flask import Blueprint
from app.controllers.site_controller import (
    list_sites, get_site, create_site, update_site, delete_site
)

site_bp = Blueprint("sites", __name__, url_prefix="/api/sites")

site_bp.get("")(list_sites)
site_bp.get("/<int:site_id>")(get_site)
site_bp.post("")(create_site)
site_bp.put("/<int:site_id>")(update_site)
site_bp.delete("/<int:site_id>")(delete_site)
