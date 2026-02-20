import re
import json
from flask import request, jsonify
from flask_login import current_user

from app.extensions import db
from app.models import Site
from app.utils.auth import admin_required


def _slugify(value: str) -> str:
    value = (value or "").strip().lower()
    value = re.sub(r"[^a-z0-9]+", "-", value)
    return value.strip("-")


def _site_to_dict(site: Site):
    return {
        "id": site.id,
        "name": site.name,
        "slug": site.slug,
        "createdById": site.created_by_id,
        "config": json.loads(site.config) if site.config else None,
        "createdAt": site.created_at.isoformat() if site.created_at else None,
        "updatedAt": site.updated_at.isoformat() if site.updated_at else None,
    }


def list_sites():
    """
    List sites
    ---
    tags:
      - Sites
    responses:
      200:
        description: Sites list
        schema:
          $ref: '#/definitions/SitesListResponse'
    """
    sites = Site.query.order_by(Site.created_at.desc()).all()
    return jsonify({"sites": [_site_to_dict(s) for s in sites]}), 200


def get_site(site_id: int):
    """
    Get site by id
    ---
    tags:
      - Sites
    parameters:
      - in: path
        name: site_id
        required: true
        type: integer
    responses:
      200:
        description: Site
        schema:
          type: object
          properties:
            site: { $ref: '#/definitions/Site' }
      404:
        description: Not found
        schema: { $ref: '#/definitions/Error' }
    """
    site = db.session.get(Site, site_id)
    if not site:
        return jsonify({"error": "Site not found"}), 404
    return jsonify({"site": _site_to_dict(site)}), 200


@admin_required
def create_site():
    """
    Create site (admin)
    ---
    tags:
      - Sites
    security:
      - cookieAuth: []
    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          required: [name]
          properties:
            name: { type: string, example: "My Site" }
            slug: { type: string, example: "my-site" }
            config: { type: object }
    responses:
      201:
        description: Created
        schema:
          type: object
          properties:
            message: { type: string }
            site: { $ref: '#/definitions/Site' }
      400:
        description: Validation
        schema: { $ref: '#/definitions/Error' }
      409:
        description: Slug exists
        schema: { $ref: '#/definitions/Error' }
      401:
        schema: { $ref: '#/definitions/Error' }
      403:
        schema: { $ref: '#/definitions/Error' }
    """
    data = request.get_json(silent=True) or {}
    name = (data.get("name") or "").strip()
    slug = (data.get("slug") or "").strip()
    config = data.get("config") 

    if not name:
        return jsonify({"error": "Name is required"}), 400

    if not slug:
        slug = _slugify(name)
    else:
        slug = _slugify(slug)

    if not slug:
        return jsonify({"error": "Invalid slug"}), 400

    if Site.query.filter_by(slug=slug).first():
        return jsonify({"error": "Slug already exists"}), 409

    site = Site(
        name=name,
        slug=slug,
        created_by_id=current_user.id,
        config=json.dumps(config) if config is not None else None,
    )

    db.session.add(site)
    db.session.commit()

    return jsonify({"message": "Site created", "site": _site_to_dict(site)}), 201


@admin_required
def update_site(site_id: int):
    """
    Update site (admin)
    ---
    tags:
      - Sites
    security:
      - cookieAuth: []
    parameters:
      - in: path
        name: site_id
        required: true
        type: integer
      - in: body
        name: body
        required: true
        schema:
          type: object
          properties:
            name: { type: string }
            slug: { type: string }
            config: { type: object }
    responses:
      200:
        description: Updated
        schema:
          type: object
          properties:
            message: { type: string }
            site: { $ref: '#/definitions/Site' }
      400:
        schema: { $ref: '#/definitions/Error' }
      404:
        schema: { $ref: '#/definitions/Error' }
      409:
        schema: { $ref: '#/definitions/Error' }
      401:
        schema: { $ref: '#/definitions/Error' }
      403:
        schema: { $ref: '#/definitions/Error' }
    """
    site = db.session.get(Site, site_id)
    if not site:
        return jsonify({"error": "Site not found"}), 404

    data = request.get_json(silent=True) or {}

    if "name" in data:
        site.name = (data.get("name") or "").strip() or site.name

    if "slug" in data:
        new_slug = _slugify(data.get("slug"))
        if not new_slug:
            return jsonify({"error": "Invalid slug"}), 400
        exists = Site.query.filter(Site.slug == new_slug, Site.id != site.id).first()
        if exists:
            return jsonify({"error": "Slug already exists"}), 409
        site.slug = new_slug

    if "config" in data:
        site.config = json.dumps(data.get("config")) if data.get("config") is not None else None

    db.session.commit()
    return jsonify({"message": "Site updated", "site": _site_to_dict(site)}), 200


@admin_required
def delete_site(site_id: int):
    """
    Delete site (admin)
    ---
    tags:
      - Sites
    security:
      - cookieAuth: []
    parameters:
      - in: path
        name: site_id
        required: true
        type: integer
    responses:
      200:
        description: Deleted
        schema:
          type: object
          properties:
            message: { type: string }
      404:
        schema: { $ref: '#/definitions/Error' }
      401:
        schema: { $ref: '#/definitions/Error' }
      403:
        schema: { $ref: '#/definitions/Error' }
    """
    site = db.session.get(Site, site_id)
    if not site:
        return jsonify({"error": "Site not found"}), 404

    db.session.delete(site)
    db.session.commit()
    return jsonify({"message": "Site deleted"}), 200
