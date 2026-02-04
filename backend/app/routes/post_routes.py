from flask import Blueprint
from app.controllers.post_controller import (
    list_posts, get_post, get_post_by_slug, create_post, update_post, delete_post
)

post_bp = Blueprint("posts", __name__, url_prefix="/api/posts")

post_bp.get("")(list_posts)
post_bp.get("/<int:post_id>")(get_post)
post_bp.get("/site/<int:site_id>/<string:slug>")(get_post_by_slug)

post_bp.post("")(create_post)
post_bp.put("/<int:post_id>")(update_post)
post_bp.delete("/<int:post_id>")(delete_post)
