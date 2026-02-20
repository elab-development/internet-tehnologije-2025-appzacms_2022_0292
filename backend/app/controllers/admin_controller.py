import enum
from flask import request, jsonify
from sqlalchemy import func

from app.extensions import db
from flask_login import current_user

from app.models import User, UserRole, Site, Page, Post
from app.utils.auth import admin_required


def _user_to_dict(u: User):
    role_val = u.role.value if hasattr(u.role, "value") else str(u.role)
    return {
        "id": u.id,
        "name": u.name,
        "email": u.email,
        "role": role_val,
        "createdAt": u.created_at.isoformat() if u.created_at else None,
        "updatedAt": u.updated_at.isoformat() if u.updated_at else None,
    }


def _normalize_role(value: str):
    """
    Prima: "admin"/"user" ili "ADMIN"/"USER" i vraća UserRole enum.
    """
    if not value:
        return None

    v = str(value).strip().lower()
    if v in ("admin", "user"):
        return UserRole.ADMIN if v == "admin" else UserRole.USER

    try:
        return UserRole[str(value).strip().upper()]
    except Exception:
        return None


@admin_required
def set_user_role(user_id: int):
    """
    PUT /api/admin/users/<id>/role
    body: { "role": "admin" | "user" }
    """
    u = db.session.get(User, user_id)
    if not u:
        return jsonify({"error": "User not found"}), 404

    data = request.get_json(silent=True) or {}
    next_role = _normalize_role(data.get("role"))

    if next_role is None:
        return jsonify({"error": "Invalid role. Allowed: admin, user"}), 400

    if current_user.is_authenticated and current_user.id == u.id and next_role != UserRole.ADMIN:
        return jsonify({"error": "You cannot remove your own admin role."}), 400

    u.role = next_role  
    db.session.commit()

    return jsonify({"message": "Role updated", "user": _user_to_dict(u)}), 200


@admin_required
def list_users():
    """
    GET /api/admin/users
    Opcioni query params:
      - q: pretraga po name/email (contains, case-insensitive)
      - role: admin|user
      - sort: createdAt_desc | createdAt_asc | name_asc | name_desc (opciono)
    """
    q = (request.args.get("q") or "").strip()
    role = (request.args.get("role") or "").strip().lower()
    sort = (request.args.get("sort") or "createdAt_desc").strip()

    query = User.query

    if q:
        like = f"%{q}%"
        query = query.filter(
            db.or_(
                User.name.ilike(like),
                User.email.ilike(like),
            )
        )

    if role in ("admin", "user"):
        target = UserRole.ADMIN if role == "admin" else UserRole.USER
        query = query.filter(User.role == target)

    if sort == "createdAt_asc":
        query = query.order_by(User.created_at.asc())
    elif sort == "name_asc":
        query = query.order_by(User.name.asc())
    elif sort == "name_desc":
        query = query.order_by(User.name.desc())
    else:
        query = query.order_by(User.created_at.desc())

    users = query.all()
    return jsonify({"users": [_user_to_dict(u) for u in users]}), 200


@admin_required
def overview():
    """
    GET /api/admin/overview
    Vraća osnovne statistike za dashboard/charts.
    """

    total_users = db.session.query(func.count(User.id)).scalar() or 0
    total_sites = db.session.query(func.count(Site.id)).scalar() or 0
    total_pages = db.session.query(func.count(Page.id)).scalar() or 0
    total_posts = db.session.query(func.count(Post.id)).scalar() or 0

    users_by_role_rows = (
        db.session.query(User.role, func.count(User.id))
        .group_by(User.role)
        .all()
    )
    users_by_role = [
        {
            "role": (r.value if hasattr(r, "value") else str(r)),
            "count": int(c),
        }
        for r, c in users_by_role_rows
    ]

    pages_by_status_rows = (
        db.session.query(Page.status, func.count(Page.id))
        .group_by(Page.status)
        .all()
    )
    pages_by_status = [{"status": s, "count": int(c)} for s, c in pages_by_status_rows]

    posts_by_status_rows = (
        db.session.query(Post.status, func.count(Post.id))
        .group_by(Post.status)
        .all()
    )
    posts_by_status = [{"status": s, "count": int(c)} for s, c in posts_by_status_rows]

    top_sites_rows = (
        db.session.query(
            Site.id,
            Site.name,
            Site.slug,
            func.count(func.distinct(Page.id)).label("pagesCount"),
            func.count(func.distinct(Post.id)).label("postsCount"),
        )
        .outerjoin(Page, Page.site_id == Site.id)
        .outerjoin(Post, Post.site_id == Site.id)
        .group_by(Site.id)
        .order_by((func.count(func.distinct(Page.id)) + func.count(func.distinct(Post.id))).desc())
        .limit(5)
        .all()
    )

    top_sites = []
    for sid, name, slug, pc, poc in top_sites_rows:
        top_sites.append(
            {
                "siteId": sid,
                "name": name,
                "slug": slug,
                "pagesCount": int(pc),
                "postsCount": int(poc),
                "total": int(pc) + int(poc),
            }
        )

    return jsonify(
        {
            "totals": {
                "users": int(total_users),
                "sites": int(total_sites),
                "pages": int(total_pages),
                "posts": int(total_posts),
            },
            "usersByRole": users_by_role,
            "pagesByStatus": pages_by_status,
            "postsByStatus": posts_by_status,
            "topSites": top_sites,
        }
    ), 200