import logging
import threading

import flask_testing
import sqlalchemy
from sqlalchemy import orm

from app import app
from app import app_config
from config import settings
from database import db
from testing import test_data
from util import patches
assert patches  # Silence pyflakes

app_creation_lock = threading.Lock()

_app = None

# Silence annoying missing handler warnings
logging.getLogger('apilib.service').addHandler(logging.NullHandler())

class TestSetupException(Exception):
    pass

# To use this, you must first create a Postgres DB called 'unittest',
# or whatever the value of your TEST_DATABASE_URI variable.
class DatabaseWithTestdataTest(flask_testing.TestCase):
    SQLALCHEMY_DATABASE_URI = settings.TEST_DATABASE_URI
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    TESTING = True
    SECRET_KEY = 'secret_key'
    CREATE_DEFAULT_APP_CONTEXT = True

    # Temporary workaroudn for https://github.com/pallets/flask/issues/2549
    JSONIFY_PRETTYPRINT_REGULAR = False

    def create_app(self):
        return self._app

    @classmethod
    def _create_app(cls):
        global _app
        with app_creation_lock:
            if _app:
                return _app
            app.config.from_object(cls)
            app_config.init_app(app)
            _app = app
            return app

    @classmethod
    def setUpClass(cls):
        cls._app = cls._create_app()
        cls._app.app_context().push()
        try:
            cls.connection = db.engine.connect()
        except sqlalchemy.exc.OperationalError as e:
            if 'FATAL:  database "unittest" does not exist' in e.message:
                raise TestSetupException('No unittest database was found. To create one:\ncreatedb unittest"')
            else:
                raise
        cls.transaction = cls.connection.begin()
        db.Model.metadata.create_all(bind=cls.connection)
        dbfixture, testdatas = test_data.setup_testdata(cls.connection)
        for data in testdatas:
            data.setup()

    @classmethod
    def tearDownClass(cls):
        cls.transaction.rollback()
        cls.connection.close()
        db.engine.dispose()

    def setUp(self):
        def cleanup_db():
            self.current_transaction.rollback()
            if self.app_context:
                self.app_context.pop()
        self.addCleanup(cleanup_db)

        self.current_transaction = self.connection.begin_nested()
        db.session = orm.scoped_session(
            orm.sessionmaker(bind=self.connection))

        if self.CREATE_DEFAULT_APP_CONTEXT:
            self.app_context = app.test_request_context('/testing')
            self.app_context.push()
            app.preprocess_request()
        else:
            self.app_context = None
