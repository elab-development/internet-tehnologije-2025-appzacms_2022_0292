import json
from flask import request, jsonify
from flask_login import current_user

from app.extensions import db
from app.models import Template
from app.utils.auth import admin_required


ALLOWED_TYPES = {"page", "post", "both"}


def _template_to_dict(t: Template):
    return {
        "id": t.id,
        "name": t.name,
        "type": t.type,
        "config": json.loads(t.config) if t.config else None,
        "createdById": t.created_by_id,
        "createdAt": t.created_at.isoformat() if t.created_at else None,
        "updatedAt": t.updated_at.isoformat() if t.updated_at else None,
    }


def list_templates():
    templates = Template.query.order_by(Template.created_at.desc()).all()
    return jsonify({"templates": [_template_to_dict(t) for t in templates]}), 200


def get_template(template_id: int):
    t = db.session.get(Template, template_id)
    if not t:
        return jsonify({"error": "Template not found"}), 404
    return jsonify({"template": _template_to_dict(t)}), 200


@admin_required
def create_template():
    data = request.get_json(silent=True) or {}
    name = (data.get("name") or "").strip()
    ttype = (data.get("type") or "both").strip().lower()
    config = data.get("config")  # dict ili None

    if not name:
        return jsonify({"error": "Name is required"}), 400

    if ttype not in ALLOWED_TYPES:
        return jsonify({"error": f"Invalid type. Allowed: {sorted(ALLOWED_TYPES)}"}), 400

    if Template.query.filter_by(name=name).first():
        return jsonify({"error": "Template name already exists"}), 409

    t = Template(
        name=name,
        type=ttype,
        config=json.dumps(config) if config is not None else None,
        created_by_id=current_user.id,
    )

    db.session.add(t)
    db.session.commit()

    return jsonify({"message": "Template created", "template": _template_to_dict(t)}), 201


@admin_required
def update_template(template_id: int):
    t = db.session.get(Template, template_id)
    if not t:
        return jsonify({"error": "Template not found"}), 404

    data = request.get_json(silent=True) or {}

    if "name" in data:
        new_name = (data.get("name") or "").strip()
        if not new_name:
            return jsonify({"error": "Name cannot be empty"}), 400
        exists = Template.query.filter(Template.name == new_name, Template.id != t.id).first()
        if exists:
            return jsonify({"error": "Template name already exists"}), 409
        t.name = new_name

    if "type" in data:
        new_type = (data.get("type") or "").strip().lower()
        if new_type not in ALLOWED_TYPES:
            return jsonify({"error": f"Invalid type. Allowed: {sorted(ALLOWED_TYPES)}"}), 400
        t.type = new_type

    if "config" in data:
        t.config = json.dumps(data.get("config")) if data.get("config") is not None else None

    db.session.commit()
    return jsonify({"message": "Template updated", "template": _template_to_dict(t)}), 200


@admin_required
def delete_template(template_id: int):
    t = db.session.get(Template, template_id)
    if not t:
        return jsonify({"error": "Template not found"}), 404

    db.session.delete(t)
    db.session.commit()
    return jsonify({"message": "Template deleted"}), 200
