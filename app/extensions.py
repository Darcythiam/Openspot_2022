try:
	from flask_sqlalchemy import SQLAlchemy
except ImportError:
	raise ImportError(
		"Missing dependency: Flask-SQLAlchemy is not installed. "
		"Install it with: pip install Flask-SQLAlchemy"
	)

db = SQLAlchemy()
