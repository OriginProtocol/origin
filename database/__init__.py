import flask_sqlalchemy

db = flask_sqlalchemy.SQLAlchemy(session_options=dict(autoflush=False))
