from app.extensions import db
import enum
from flask_login import UserMixin


class UserRole(enum.Enum):
    ADMIN = "admin"
    USER = "user"


class User(db.Model, UserMixin):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)

    name = db.Column(
        db.String(50),
        nullable=False,
        index=True
    )
    email = db.Column(
        db.String(150),
        unique=True,
        nullable=False,
        index=True
    )
    password = db.Column(
        db.String(255),
        nullable=False
    )
    role = db.Column(
        db.Enum(
            UserRole,
            name="user_role",
            values_callable=lambda enum_cls: [e.value for e in enum_cls],
            native_enum=True,
        ),
        nullable=False,
        default=UserRole.USER,
        server_default="user",
        index=True,
    )

    created_at = db.Column(
        db.DateTime,
        server_default=db.func.now(),
        nullable=False,
    )

    updated_at = db.Column(
        db.DateTime,
        server_default=db.func.now(),
        onupdate=db.func.now(),
        nullable=False,
    )

class Site(db.Model):
    __tablename__ = "sites"

    id = db.Column(db.Integer, primary_key=True)

    name = db.Column(db.String(120), nullable=False)
    slug = db.Column(db.String(120), nullable=False, unique=True, index=True)

    created_by_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    created_by = db.relationship("User", backref=db.backref("sites_created", lazy=True))
    config = db.Column(db.Text, nullable=True)

    created_at = db.Column(db.DateTime, server_default=db.func.now(), nullable=False)
    updated_at = db.Column(db.DateTime, server_default=db.func.now(), onupdate=db.func.now(), nullable=False)

class Template(db.Model):
    __tablename__ = "templates"

    id = db.Column(db.Integer, primary_key=True)

    name = db.Column(db.String(120), nullable=False, unique=True, index=True)

    type = db.Column(db.String(20), nullable=False, server_default="both", index=True)
    config = db.Column(db.Text, nullable=True)

    created_by_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    created_by = db.relationship("User", backref=db.backref("templates_created", lazy=True))

    created_at = db.Column(db.DateTime, server_default=db.func.now(), nullable=False)
    updated_at = db.Column(db.DateTime, server_default=db.func.now(), onupdate=db.func.now(), nullable=False)

class Page(db.Model):
    __tablename__ = "pages"

    id = db.Column(db.Integer, primary_key=True)

    site_id = db.Column(db.Integer, db.ForeignKey("sites.id"), nullable=False, index=True)
    site = db.relationship("Site", backref=db.backref("pages", lazy=True, cascade="all,delete-orphan"))

    template_id = db.Column(db.Integer, db.ForeignKey("templates.id"), nullable=True, index=True)
    template = db.relationship("Template", backref=db.backref("pages", lazy=True))

    title = db.Column(db.String(200), nullable=False)
    slug = db.Column(db.String(200), nullable=False, index=True)

    content = db.Column(db.Text, nullable=False, server_default='{"version":1,"blocks":[]}')

    status = db.Column(db.String(20), nullable=False, server_default="draft", index=True)  # draft/published

    created_by_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    created_by = db.relationship("User", backref=db.backref("pages_created", lazy=True))

    created_at = db.Column(db.DateTime, server_default=db.func.now(), nullable=False)
    updated_at = db.Column(db.DateTime, server_default=db.func.now(), onupdate=db.func.now(), nullable=False)

    __table_args__ = (
        db.UniqueConstraint("site_id", "slug", name="uq_pages_site_slug"),
    )

class Post(db.Model):
    __tablename__ = "posts"

    id = db.Column(db.Integer, primary_key=True)

    site_id = db.Column(db.Integer, db.ForeignKey("sites.id"), nullable=False, index=True)
    site = db.relationship("Site", backref=db.backref("posts", lazy=True, cascade="all,delete-orphan"))

    template_id = db.Column(db.Integer, db.ForeignKey("templates.id"), nullable=True, index=True)
    template = db.relationship("Template", backref=db.backref("posts", lazy=True))

    author_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    author = db.relationship("User", backref=db.backref("posts", lazy=True))

    title = db.Column(db.String(200), nullable=False)
    slug = db.Column(db.String(200), nullable=False, index=True)

    content = db.Column(db.Text, nullable=False, server_default='{"version":1,"blocks":[]}')

    status = db.Column(db.String(20), nullable=False, server_default="draft", index=True)  # draft/published

    created_at = db.Column(db.DateTime, server_default=db.func.now(), nullable=False)
    updated_at = db.Column(db.DateTime, server_default=db.func.now(), onupdate=db.func.now(), nullable=False)

    __table_args__ = (
        db.UniqueConstraint("site_id", "slug", name="uq_posts_site_slug"),
    )

