from flask import Blueprint
from app.controllers.page_controller import (
    list_pages, get_page, get_page_by_slug, create_page, update_page, delete_page
)

page_bp = Blueprint("pages", __name__, url_prefix="/api/pages")

page_bp.get("")(list_pages)
page_bp.get("/<int:page_id>")(get_page)
page_bp.get("/site/<int:site_id>/<string:slug>")(get_page_by_slug)
page_bp.post("")(create_page)
page_bp.put("/<int:page_id>")(update_page)
page_bp.delete("/<int:page_id>")(delete_page)
