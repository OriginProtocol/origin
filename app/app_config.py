import logging
import sys

import flask_migrate

from config import settings
from database import db

class AppConfig(object):
    SECRET_KEY = settings.FLASK_SECRET_KEY
    CSRF_ENABLED = True

    SQLALCHEMY_DATABASE_URI = settings.SQLALCHEMY_DATABASE_URI
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ECHO = False

def init_app(app):
    db.init_app(app)
    flask_migrate.Migrate(app, db, directory='database/migrations')

# App initialization only appropriate for dev/production but not tests.
def init_prod_app(app):
    app.config.from_object(__name__ + '.AppConfig')
    init_app(app)

    log_formatter = logging.Formatter(
        '%(asctime)s %(levelname)s [in %(pathname)s:%(lineno)d]: %(message)s')
    log_level = logging.WARNING
    if not settings.DEBUG:
        # This logs to stdout which is appropriate for Heroku, which saves stdout to a file,
        # but may not be appropriate in other environments. Use a log file instead.
        handler = logging.StreamHandler(sys.stdout)
        handler.setLevel(log_level)
        handler.setFormatter(log_formatter)
        app.logger.addHandler(handler)
    return app
