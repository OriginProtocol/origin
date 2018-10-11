import logging.config
import sys

import flask_migrate

from config import settings
from database import db
from flask_session import Session
from api import start_restful_api


class AppConfig(object):
    SECRET_KEY = settings.FLASK_SECRET_KEY
    SESSION_TYPE = 'filesystem'
    CSRF_ENABLED = True

    SQLALCHEMY_DATABASE_URI = settings.DATABASE_URL
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ECHO = False


def init_api(app):
    start_restful_api(app)


def init_app(app):
    sess = Session()
    sess.init_app(app)
    db.init_app(app)
    flask_migrate.Migrate(app, db, directory='database/migrations')


# App initialization only appropriate for dev/production but not tests.
def init_prod_app(app):
    app.config.from_object(__name__ + '.AppConfig')
    init_app(app)
    init_api(app)

    # Setup logging.
    if not settings.DEBUG:
        # This logs to stdout which is appropriate for Heroku,
        # which saves stdout to a file, but may not be appropriate in
        # other environments. Use a log file instead.
        log_formatter = logging.Formatter(
            '%(asctime)s %(levelname)s [in %(pathname)s:%(lineno)d]: %(message)s')
        handler = logging.StreamHandler(sys.stdout)
        handler.setLevel(logging.INFO)
        handler.setFormatter(log_formatter)
        app.logger.addHandler(handler)
    else:
        logging.config.fileConfig('debug.logging.ini')

    return app
