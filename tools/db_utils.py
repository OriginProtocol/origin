from app import app
from app import app_config
from database import db
from database import db_models
from util import patches

# Silence pyflakes
assert db_models
assert patches

app_config.init_prod_app(app)


def request_context():
    return app.app_context()


def create_all():
    with request_context():
        db.create_all()


def drop_all():
    with request_context():
        db.drop_all()
