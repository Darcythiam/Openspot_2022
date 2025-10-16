import os
from flask import Flask
from flask_cors import CORS
from flask_migrate import Migrate
from .extensions import db
from .routes.health import health_bp
from .routes.lots import lots_bp
from .routes.sessions import sessions_bp

def create_app():
    app = Flask(__name__, static_folder="../client", static_url_path="/")
    app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv(
        "DATABASE_URL", "postgresql+psycopg://postgres:postgres@db:5432/openspot_2022"
    )
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "dev")

    CORS(app, resources={r"/api/*": {"origins": "*"}})

    db.init_app(app)
    Migrate(app, db)

    # Blueprints (API)
    app.register_blueprint(health_bp, url_prefix="/api")
    app.register_blueprint(lots_bp, url_prefix="/api")
    app.register_blueprint(sessions_bp, url_prefix="/api")

    # Serve frontend
    @app.get("/")
    def index():
        return app.send_static_file("index.html")

    return app
