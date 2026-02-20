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
    """
    List templates
    ---
    tags:
      - Templates
    responses:
      200:
        description: Templates list
        schema:
          $ref: '#/definitions/TemplatesListResponse'
    """
    templates = Template.query.order_by(Template.created_at.desc()).all()
    return jsonify({"templates": [_template_to_dict(t) for t in templates]}), 200


def get_template(template_id: int):
    """
    Get template by id
    ---
    tags:
      - Templates
    parameters:
      - in: path
        name: template_id
        required: true
        type: integer
    responses:
      200:
        description: Template
        schema:
          type: object
          properties:
            template:
              $ref: '#/definitions/Template'
      404:
        description: Template not found
        schema:
          $ref: '#/definitions/Error'
    """
    t = db.session.get(Template, template_id)
    if not t:
        return jsonify({"error": "Template not found"}), 404
    return jsonify({"template": _template_to_dict(t)}), 200


@admin_required
def create_template():
    """
    Create template (admin)
    ---
    tags:
      - Templates
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
            name: { type: string, example: "Minimal Blog" }
            type:
              type: string
              enum: ["page", "post", "both"]
              example: "both"
            config:
              type: object
              example:
                styles:
                  text: "text-gray-700"
                blocks:
                  allowed: ["hero","text","quote","button"]
    responses:
      201:
        description: Created
        schema:
          type: object
          properties:
            message: { type: string }
            template:
              $ref: '#/definitions/Template'
      400:
        description: Validation error
        schema: { $ref: '#/definitions/Error' }
      401:
        description: Unauthorized
        schema: { $ref: '#/definitions/Error' }
      403:
        description: Forbidden (not admin)
        schema: { $ref: '#/definitions/Error' }
      409:
        description: Template name already exists
        schema: { $ref: '#/definitions/Error' }
    """
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
    """
    Update template (admin)
    ---
    tags:
      - Templates
    security:
      - cookieAuth: []
    parameters:
      - in: path
        name: template_id
        required: true
        type: integer
      - in: body
        name: body
        required: true
        schema:
          type: object
          properties:
            name: { type: string, example: "Minimal Blog v2" }
            type:
              type: string
              enum: ["page", "post", "both"]
              example: "page"
            config:
              type: object
              example:
                styles:
                  quote: "border-l-4 pl-3 italic"
    responses:
      200:
        description: Updated
        schema:
          type: object
          properties:
            message: { type: string }
            template:
              $ref: '#/definitions/Template'
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
        description: Template not found
        schema: { $ref: '#/definitions/Error' }
      409:
        description: Template name already exists
        schema: { $ref: '#/definitions/Error' }
    """
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
    """
    Delete template (admin)
    ---
    tags:
      - Templates
    security:
      - cookieAuth: []
    parameters:
      - in: path
        name: template_id
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
        description: Template not found
        schema: { $ref: '#/definitions/Error' }
    """
    t = db.session.get(Template, template_id)
    if not t:
        return jsonify({"error": "Template not found"}), 404

    db.session.delete(t)
    db.session.commit()
    return jsonify({"message": "Template deleted"}), 200
