from app.extensions import db
import enum


class UserRole(enum.Enum):
    ADMIN = "admin"
    USER = "user"


class User(db.Model):
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
        db.Enum(UserRole, name="user_role"),
        nullable=False,
        default=UserRole.USER,
        server_default="user",
        index=True
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
