import re
import json
from flask import request, jsonify
from flask_login import current_user

from app.extensions import db
from app.models import Page, Site, Template
from app.utils.auth import admin_required


ALLOWED_STATUS = {"draft", "published"}


def _slugify(value: str) -> str:
    value = (value or "").strip().lower()
    value = re.sub(r"[^a-z0-9]+", "-", value)
    return value.strip("-")


def _page_to_dict(p: Page):
    return {
        "id": p.id,
        "siteId": p.site_id,
        "templateId": p.template_id,
        "title": p.title,
        "slug": p.slug,
        "content": json.loads(p.content) if p.content else {"version": 1, "blocks": []},
        "status": p.status,
        "createdById": p.created_by_id,
        "createdAt": p.created_at.isoformat() if p.created_at else None,
        "updatedAt": p.updated_at.isoformat() if p.updated_at else None,
    }


def list_pages():
    """
    List pages
    ---
    tags:
      - Pages
    parameters:
      - in: query
        name: siteId
        type: integer
        required: false
        description: Filter pages by site id
    responses:
      200:
        description: Pages list
        schema:
          $ref: '#/definitions/PagesListResponse'
    """
    site_id = request.args.get("siteId", type=int)
    q = Page.query
    if site_id:
        q = q.filter(Page.site_id == site_id)
    pages = q.order_by(Page.created_at.desc()).all()
    return jsonify({"pages": [_page_to_dict(p) for p in pages]}), 200


def get_page(page_id: int):
    """
    Get page by id
    ---
    tags:
      - Pages
    parameters:
      - in: path
        name: page_id
        required: true
        type: integer
    responses:
      200:
        description: Page
        schema:
          type: object
          properties:
            page:
              $ref: '#/definitions/Page'
      404:
        description: Page not found
        schema: { $ref: '#/definitions/Error' }
    """
    p = db.session.get(Page, page_id)
    if not p:
        return jsonify({"error": "Page not found"}), 404
    return jsonify({"page": _page_to_dict(p)}), 200


def get_page_by_slug(site_id: int, slug: str):
    """
    Get page by site + slug
    ---
    tags:
      - Pages
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
        description: Page
        schema:
          type: object
          properties:
            page:
              $ref: '#/definitions/Page'
      404:
        description: Page not found
        schema: { $ref: '#/definitions/Error' }
    """
    slug = _slugify(slug)
    p = Page.query.filter_by(site_id=site_id, slug=slug).first()
    if not p:
        return jsonify({"error": "Page not found"}), 404
    return jsonify({"page": _page_to_dict(p)}), 200


@admin_required
def create_page():
    """
    Create page (admin)
    ---
    tags:
      - Pages
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
            title: { type: string, example: "About us" }
            slug: { type: string, example: "about-us" }
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
            page: { $ref: '#/definitions/Page' }
      400:
        description: Validation error
        schema: { $ref: '#/definitions/Error' }
      401:
        description: Unauthorized
        schema: { $ref: '#/definitions/Error' }
      403:
        description: Forbidden (not admin)
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

    # slug unique po site
    exists = Page.query.filter_by(site_id=int(site_id), slug=slug).first()
    if exists:
        return jsonify({"error": "Slug already exists for this site"}), 409

    p = Page(
        site_id=int(site_id),
        template_id=int(template_id) if template_id is not None else None,
        title=title,
        slug=slug,
        content=json.dumps(content),
        status=status,
        created_by_id=current_user.id,
    )

    db.session.add(p)
    db.session.commit()
    return jsonify({"message": "Page created", "page": _page_to_dict(p)}), 201


@admin_required
def update_page(page_id: int):
    """
    Update page (admin)
    ---
    tags:
      - Pages
    security:
      - cookieAuth: []
    parameters:
      - in: path
        name: page_id
        required: true
        type: integer
      - in: body
        name: body
        required: true
        schema:
          type: object
          properties:
            title: { type: string, example: "About us (updated)" }
            slug: { type: string, example: "about-us" }
            templateId:
              type: ["integer", "null"]
              example: 2
              description: "Set null to remove template"
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
            page: { $ref: '#/definitions/Page' }
      400:
        description: Validation error
        schema: { $ref: '#/definitions/Error' }
      401:
        description: Unauthorized
        schema: { $ref: '#/definitions/Error' }
      403:
        description: Forbidden (not admin)
        schema: { $ref: '#/definitions/Error' }
      404:
        description: Page/Template not found
        schema: { $ref: '#/definitions/Error' }
      409:
        description: Slug already exists for this site
        schema: { $ref: '#/definitions/Error' }
    """
    p = db.session.get(Page, page_id)
    if not p:
        return jsonify({"error": "Page not found"}), 404

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
        exists = Page.query.filter(Page.site_id == p.site_id, Page.slug == new_slug, Page.id != p.id).first()
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
    return jsonify({"message": "Page updated", "page": _page_to_dict(p)}), 200


@admin_required
def delete_page(page_id: int):
    """
    Delete page (admin)
    ---
    tags:
      - Pages
    security:
      - cookieAuth: []
    parameters:
      - in: path
        name: page_id
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
        description: Forbidden (not admin)
        schema: { $ref: '#/definitions/Error' }
      404:
        description: Page not found
        schema: { $ref: '#/definitions/Error' }
    """
    p = db.session.get(Page, page_id)
    if not p:
        return jsonify({"error": "Page not found"}), 404

    db.session.delete(p)
    db.session.commit()
    return jsonify({"message": "Page deleted"}), 200
