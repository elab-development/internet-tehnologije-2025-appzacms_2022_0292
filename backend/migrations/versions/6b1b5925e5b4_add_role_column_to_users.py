"""add role column to users

Revision ID: 6b1b5925e5b4
Revises: a51f69fb6f91
Create Date: 2026-02-08 15:09:08.680240

"""
import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql



# revision identifiers, used by Alembic.
revision = '6b1b5925e5b4'
down_revision = 'a51f69fb6f91'
branch_labels = None
depends_on = None


def upgrade():
    # 1) Kreiraj enum type u bazi (ako ne postoji)
    user_role = postgresql.ENUM("admin", "user", name="user_role")
    user_role.create(op.get_bind(), checkfirst=True)

    # 2) Dodaj kolonu koja koristi taj enum
    with op.batch_alter_table("users", schema=None) as batch_op:
        batch_op.add_column(
            sa.Column(
                "role",
                user_role,
                nullable=False,
                server_default="user",
            )
        )

    # (opciono) skloni server_default posle popunjavanja
    with op.batch_alter_table("users", schema=None) as batch_op:
        batch_op.alter_column("role", server_default=None)


def downgrade():
    user_role = postgresql.ENUM("admin", "user", name="user_role")

    with op.batch_alter_table("users", schema=None) as batch_op:
        batch_op.drop_column("role")

    user_role.drop(op.get_bind(), checkfirst=True)
