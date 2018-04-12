import logging
import sys

import flask_migrate
import flask_restless

from config import settings
from database import db
from database import db_models
from flask.ext.session import Session


class AppConfig(object):
    SECRET_KEY = settings.FLASK_SECRET_KEY
    SESSION_TYPE = 'filesystem'
    CSRF_ENABLED = True

    SQLALCHEMY_DATABASE_URI = settings.DATABASE_URL
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ECHO = False


def init_app(app):
    sess = Session()
    sess.init_app(app)
    db.init_app(app)
    flask_migrate.Migrate(app, db, directory='database/migrations')


def init_api(app):
    # Create the Flask-Restless API manager.
    manager = flask_restless.APIManager(app, flask_sqlalchemy_db=db)
    # Create API endpoints, which will be available at /api/<tablename> by
    # default. Allowed HTTP methods can be specified as well.
    manager.create_api(db_models.Listing, methods=['GET'],
                       primary_key='registry_id',
                       results_per_page=10,)


# App initialization only appropriate for dev/production but not tests.
def init_prod_app(app):
    app.config.from_object(__name__ + '.AppConfig')
    init_app(app)
    init_api(app)
    log_formatter = logging.Formatter(
        '%(asctime)s %(levelname)s [in %(pathname)s:%(lineno)d]: %(message)s')
    log_level = logging.WARNING
    if not settings.DEBUG:
        # This logs to stdout which is appropriate for Heroku, which saves
        # stdout to a file,
        # but may not be appropriate in other environments. Use a log file
        # instead.
        handler = logging.StreamHandler(sys.stdout)
        handler.setLevel(log_level)
        handler.setFormatter(log_formatter)
        app.logger.addHandler(handler)

    return app
