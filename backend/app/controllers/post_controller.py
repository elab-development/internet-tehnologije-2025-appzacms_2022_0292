import re
import json
from flask import request, jsonify
from flask_login import current_user

from app.extensions import db
from app.models import Post, Site, Template, UserRole
from app.utils.auth import login_required_json


ALLOWED_STATUS = {"draft", "published"}

def _slugify(value: str) -> str:
    value = (value or "").strip().lower()
    value = re.sub(r"[^a-z0-9]+", "-", value)
    return value.strip("-")

def _post_to_dict(p: Post):
    return {
        "id": p.id,
        "siteId": p.site_id,
        "templateId": p.template_id,
        "authorId": p.author_id,
        "title": p.title,
        "slug": p.slug,
        "content": json.loads(p.content) if p.content else {"version": 1, "blocks": []},
        "status": p.status,
        "createdAt": p.created_at.isoformat() if p.created_at else None,
        "updatedAt": p.updated_at.isoformat() if p.updated_at else None,
    }

def _can_edit(post: Post) -> bool:
    if not current_user.is_authenticated:
        return False
    if current_user.role == UserRole.ADMIN:
        return True
    return current_user.id == post.author_id


def list_posts():
    """
    List posts
    ---
    tags:
      - Posts
    parameters:
      - in: query
        name: siteId
        type: integer
        required: false
      - in: query
        name: authorId
        type: integer
        required: false
      - in: query
        name: status
        type: string
        required: false
        enum: ["draft", "published"]
    responses:
      200:
        description: Posts list
        schema:
          $ref: '#/definitions/PostsListResponse'
    """
    site_id = request.args.get("siteId", type=int)
    author_id = request.args.get("authorId", type=int)
    status = request.args.get("status", type=str)

    q = Post.query
    if site_id:
        q = q.filter(Post.site_id == site_id)
    if author_id:
        q = q.filter(Post.author_id == author_id)
    if status:
        q = q.filter(Post.status == status)

    posts = q.order_by(Post.created_at.desc()).all()
    return jsonify({"posts": [_post_to_dict(p) for p in posts]}), 200


def get_post(post_id: int):
    """
    Get post by id
    ---
    tags:
      - Posts
    parameters:
      - in: path
        name: post_id
        required: true
        type: integer
    responses:
      200:
        description: Post
        schema:
          type: object
          properties:
            post:
              $ref: '#/definitions/Post'
      404:
        description: Post not found
        schema: { $ref: '#/definitions/Error' }
    """
    p = db.session.get(Post, post_id)
    if not p:
        return jsonify({"error": "Post not found"}), 404
    return jsonify({"post": _post_to_dict(p)}), 200


def get_post_by_slug(site_id: int, slug: str):
    """
    Get post by site + slug
    ---
    tags:
      - Posts
    parameters:
      - in: path
        name: site_id
        required: true
        type: integer
      - in: path
        name: slug
        required: true
        type: string
    responses:
      200:
        description: Post
        schema:
          type: object
          properties:
            post:
              $ref: '#/definitions/Post'
      404:
        description: Post not found
        schema: { $ref: '#/definitions/Error' }
    """
    slug = _slugify(slug)
    p = Post.query.filter_by(site_id=site_id, slug=slug).first()
    if not p:
        return jsonify({"error": "Post not found"}), 404
    return jsonify({"post": _post_to_dict(p)}), 200


@login_required_json
def create_post():
    """
    Create post (auth)
    ---
    tags:
      - Posts
    security:
      - cookieAuth: []
    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          required: [siteId, title]
          properties:
            siteId: { type: integer, example: 1 }
            title: { type: string, example: "My first post" }
            slug: { type: string, example: "my-first-post" }
            templateId: { type: integer, example: 2 }
            status:
              type: string
              enum: ["draft", "published"]
              example: "draft"
            content:
              $ref: '#/definitions/BlockTree'
    responses:
      201:
        description: Created
        schema:
          type: object
          properties:
            message: { type: string }
            post: { $ref: '#/definitions/Post' }
      400:
        description: Validation error
        schema: { $ref: '#/definitions/Error' }
      401:
        description: Unauthorized
        schema: { $ref: '#/definitions/Error' }
      404:
        description: Site/Template not found
        schema: { $ref: '#/definitions/Error' }
      409:
        description: Slug already exists for this site
        schema: { $ref: '#/definitions/Error' }
    """
    data = request.get_json(silent=True) or {}

    site_id = data.get("siteId")
    title = (data.get("title") or "").strip()
    slug = (data.get("slug") or "").strip()
    template_id = data.get("templateId")
    content = data.get("content")
    status = (data.get("status") or "draft").strip().lower()

    if not site_id:
        return jsonify({"error": "siteId is required"}), 400
    if not title:
        return jsonify({"error": "title is required"}), 400

    if not db.session.get(Site, int(site_id)):
        return jsonify({"error": "Site not found"}), 404

    if not slug:
        slug = _slugify(title)
    else:
        slug = _slugify(slug)

    if not slug:
        return jsonify({"error": "Invalid slug"}), 400

    if status not in ALLOWED_STATUS:
        return jsonify({"error": f"Invalid status. Allowed: {sorted(ALLOWED_STATUS)}"}), 400

    if template_id is not None and not db.session.get(Template, int(template_id)):
        return jsonify({"error": "Template not found"}), 404

    if content is None:
        content = {"version": 1, "blocks": []}

    if not isinstance(content, dict) or "blocks" not in content:
        return jsonify({"error": "content must be an object with 'version' and 'blocks'"}), 400
    if not isinstance(content.get("blocks"), list):
        return jsonify({"error": "content.blocks must be a list"}), 400

    exists = Post.query.filter_by(site_id=int(site_id), slug=slug).first()
    if exists:
        return jsonify({"error": "Slug already exists for this site"}), 409

    p = Post(
        site_id=int(site_id),
        template_id=int(template_id) if template_id is not None else None,
        author_id=current_user.id,
        title=title,
        slug=slug,
        content=json.dumps(content),
        status=status,
    )

    db.session.add(p)
    db.session.commit()
    return jsonify({"message": "Post created", "post": _post_to_dict(p)}), 201


@login_required_json
def update_post(post_id: int):
    """
    Update post (auth; author or admin)
    ---
    tags:
      - Posts
    security:
      - cookieAuth: []
    parameters:
      - in: path
        name: post_id
        required: true
        type: integer
      - in: body
        name: body
        required: true
        schema:
          type: object
          properties:
            title: { type: string, example: "Updated title" }
            slug: { type: string, example: "updated-slug" }
            templateId:
              type: ["integer", "null"]
              example: 2
            status:
              type: string
              enum: ["draft", "published"]
              example: "published"
            content:
              $ref: '#/definitions/BlockTree'
    responses:
      200:
        description: Updated
        schema:
          type: object
          properties:
            message: { type: string }
            post: { $ref: '#/definitions/Post' }
      400:
        description: Validation error
        schema: { $ref: '#/definitions/Error' }
      401:
        description: Unauthorized
        schema: { $ref: '#/definitions/Error' }
      403:
        description: Forbidden (not author/admin)
        schema: { $ref: '#/definitions/Error' }
      404:
        description: Post/Template not found
        schema: { $ref: '#/definitions/Error' }
      409:
        description: Slug already exists for this site
        schema: { $ref: '#/definitions/Error' }
    """
    p = db.session.get(Post, post_id)
    if not p:
        return jsonify({"error": "Post not found"}), 404

    if not _can_edit(p):
        return jsonify({"error": "Forbidden"}), 403

    data = request.get_json(silent=True) or {}

    if "title" in data:
        new_title = (data.get("title") or "").strip()
        if not new_title:
            return jsonify({"error": "title cannot be empty"}), 400
        p.title = new_title

    if "slug" in data:
        new_slug = _slugify(data.get("slug"))
        if not new_slug:
            return jsonify({"error": "Invalid slug"}), 400
        exists = Post.query.filter(Post.site_id == p.site_id, Post.slug == new_slug, Post.id != p.id).first()
        if exists:
            return jsonify({"error": "Slug already exists for this site"}), 409
        p.slug = new_slug

    if "templateId" in data:
        tid = data.get("templateId")
        if tid is None:
            p.template_id = None
        else:
            if not db.session.get(Template, int(tid)):
                return jsonify({"error": "Template not found"}), 404
            p.template_id = int(tid)

    if "status" in data:
        st = (data.get("status") or "").strip().lower()
        if st not in ALLOWED_STATUS:
            return jsonify({"error": f"Invalid status. Allowed: {sorted(ALLOWED_STATUS)}"}), 400
        p.status = st

    if "content" in data:
        content = data.get("content")
        if not isinstance(content, dict) or "blocks" not in content:
            return jsonify({"error": "content must be an object with 'version' and 'blocks'"}), 400
        if not isinstance(content.get("blocks"), list):
            return jsonify({"error": "content.blocks must be a list"}), 400
        p.content = json.dumps(content)

    db.session.commit()
    return jsonify({"message": "Post updated", "post": _post_to_dict(p)}), 200


@login_required_json
def delete_post(post_id: int):
    """
    Delete post (auth; author or admin)
    ---
    tags:
      - Posts
    security:
      - cookieAuth: []
    parameters:
      - in: path
        name: post_id
        required: true
        type: integer
    responses:
      200:
        description: Deleted
        schema:
          type: object
          properties:
            message: { type: string }
      401:
        description: Unauthorized
        schema: { $ref: '#/definitions/Error' }
      403:
        description: Forbidden (not author/admin)
        schema: { $ref: '#/definitions/Error' }
      404:
        description: Post not found
        schema: { $ref: '#/definitions/Error' }
    """
    p = db.session.get(Post, post_id)
    if not p:
        return jsonify({"error": "Post not found"}), 404

    if not _can_edit(p):
        return jsonify({"error": "Forbidden"}), 403

    db.session.delete(p)
    db.session.commit()
    return jsonify({"message": "Post deleted"}), 200
