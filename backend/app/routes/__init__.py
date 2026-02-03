from app.routes.auth_routes import auth_bp
from app.routes.site_routes import site_bp
from app.routes.template_routes import template_bp
from app.routes.page_routes import page_bp

def register_routes(app):
    app.register_blueprint(auth_bp)
    app.register_blueprint(site_bp)
    app.register_blueprint(template_bp)
    app.register_blueprint(page_bp)
