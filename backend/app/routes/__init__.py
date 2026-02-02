from app.routes.auth_routes import auth_bp
from app.routes.site_routes import site_bp

def register_routes(app):
    app.register_blueprint(auth_bp)
    app.register_blueprint(site_bp)
