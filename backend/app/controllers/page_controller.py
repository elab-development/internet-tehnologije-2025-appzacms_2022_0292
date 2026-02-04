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
    site_id = request.args.get("siteId", type=int)
    q = Page.query
    if site_id:
        q = q.filter(Page.site_id == site_id)
    pages = q.order_by(Page.created_at.desc()).all()
    return jsonify({"pages": [_page_to_dict(p) for p in pages]}), 200


def get_page(page_id: int):
    p = db.session.get(Page, page_id)
    if not p:
        return jsonify({"error": "Page not found"}), 404
    return jsonify({"page": _page_to_dict(p)}), 200


def get_page_by_slug(site_id: int, slug: str):
    slug = _slugify(slug)
    p = Page.query.filter_by(site_id=site_id, slug=slug).first()
    if not p:
        return jsonify({"error": "Page not found"}), 404
    return jsonify({"page": _page_to_dict(p)}), 200


@admin_required
def create_page():
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
    p = db.session.get(Page, page_id)
    if not p:
        return jsonify({"error": "Page not found"}), 404

    db.session.delete(p)
    db.session.commit()
    return jsonify({"message": "Page deleted"}), 200
