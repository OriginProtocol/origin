import pytest
import time
import json
from contextlib import contextmanager

from web3.providers.eth_tester import (
    EthereumTesterProvider,
)

from eth_tester import (
    EthereumTester,
    PyEthereum21Backend
)

from web3.utils.threads import (
    Timeout,
)

from web3 import Web3

from mock import patch
from testing.postgresql import Postgresql

from app import app as flask_app
from app.app_config import init_api
from database import db as _db
from config import settings


class PollDelayCounter:
    def __init__(self, initial_delay=0, max_delay=1, initial_step=0.01):
        self.initial_delay = initial_delay
        self.initial_step = initial_step
        self.max_delay = max_delay
        self.current_delay = initial_delay

    def __call__(self):
        delay = self.current_delay

        if self.current_delay == 0:
            self.current_delay += self.initial_step
        else:
            self.current_delay *= 2
            self.current_delay = min(self.current_delay, self.max_delay)

        return delay

    def reset(self):
        self.current_delay = self.initial_delay


class TestConfig(object):
    SECRET_KEY = settings.FLASK_SECRET_KEY

    SQLALCHEMY_DATABASE_URI = settings.TEST_DATABASE_URL
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ECHO = False

    CONTRACTS_DIR = settings.CONTRACT_DIR

    TESTING = True
    SERVER_NAME = 'localhost'
    CREATE_DEFAULT_APP_CONTEXT = True

    # Temporary workaroudn for https://github.com/pallets/flask/issues/2549
    JSONIFY_PRETTYPRINT_REGULAR = False


@contextmanager
def test_db(app):
    """Context manager to provide a URL for the test database. If one is
    configured, then that is used. Otherwise one is created using
    testing.postgresql."""
    test_db_url = app.config.get('SQLALCHEMY_DATABASE_URI', None)
    if test_db_url:
        # Test database configured manually, use that
        yield test_db_url
    else:
        # No test database configured, create one using testing.postgresql
        with Postgresql() as postgresql:
            yield postgresql.url()


@pytest.yield_fixture(scope='session')
def app():
    _app = flask_app
    _app.config.from_object(__name__ + '.TestConfig')
    init_api(_app)

    with test_db(_app) as test_db_url:
        _app.config['SQLALCHEMY_DATABASE_URI'] = test_db_url
        ctx = _app.app_context()
        ctx.push()

        yield _app

        ctx.pop()


@pytest.yield_fixture
def client(app):
    """A Flask test client. An instance of :class:`flask.testing.TestClient`
    by default.
    """
    with app.test_client() as client:
        yield client


@pytest.yield_fixture(scope='session')
def db(app):
    _db.app = app
    _db.init_app(app)
    _db.create_all()

    yield _db

    _db.drop_all()


@pytest.fixture(scope='function', autouse=True)
def session(db):
    connection = db.engine.connect()
    transaction = connection.begin()

    options = dict(bind=connection, binds={})
    session_ = db.create_scoped_session(options=options)

    db.session = session_

    yield session_

    transaction.rollback()
    connection.close()
    session_.remove()


@pytest.yield_fixture(scope='function')
def mock_normalize_number(app):
    patcher = patch('logic.attestation_service.normalize_number',
                    side_effect=(lambda phone: phone))
    yield patcher.start()
    patcher.stop()


@pytest.yield_fixture(scope='function')
def mock_ipfs_init(app):
    patcher = patch('util.ipfs.IPFSHelper.__init__',
                    return_value=None)
    yield patcher.start()
    patcher.stop()


def __file_from_hash(self, ipfs_hash, root_attr=None, exclude_fields=None):
    with open("./tests/ipfs/sample.json") as f:
        ipfs_data = json.loads(f.read())
    # make a copy of the data so that we're clean
    ipfs_data = ipfs_data[root_attr] if root_attr else ipfs_data
    if exclude_fields:
        for field in exclude_fields:
            ipfs_data.pop(field, None)
    return ipfs_data


@pytest.yield_fixture(scope='function')
def mock_ipfs(app, mock_ipfs_init):
    patcher = patch('util.ipfs.IPFSHelper.file_from_hash',
                    autospec=True, side_effect=__file_from_hash)
    yield patcher.start()
    patcher.stop()


@pytest.yield_fixture(scope='function')
def mock_apns(app):
    patcher = patch('logic.notifier_service.APNsClient',
                    autospec=True)
    old_cert = settings.APNS_CERT_FILE
    settings.APNS_CERT_FILE = "testing.pem"
    yield patcher.start()
    patcher.stop()
    settings.APNS_CERT_FILE = old_cert


@pytest.yield_fixture(scope='function')
def mock_fcm(app):
    patcher = patch('logic.notifier_service.FCMNotification',
                    autospec=True)
    old_key = settings.FCM_API_KEY
    settings.FCM_API_KEY = "fcm_key"
    yield patcher.start()
    patcher.stop()
    settings.FCM_API_KEY = old_key


@pytest.fixture()
def wait_for_block():
    def _wait_for_block(web3, block_number=1, timeout=None):
        if not timeout:
            timeout = (block_number - web3.eth.blockNumber) * 3
        poll_delay_counter = PollDelayCounter()
        with Timeout(timeout) as timeout:
            while True:
                if web3.eth.blockNumber >= block_number:
                    break
                web3.manager.request_blocking("evm_mine", [])
                timeout.sleep(poll_delay_counter())
    return _wait_for_block


@pytest.fixture()
def wait_for_transaction():
    def _wait_for_transaction(web3, txn_hash, timeout=120):
        poll_delay_counter = PollDelayCounter()
        with Timeout(timeout) as timeout:
            while True:
                txn_receipt = web3.eth.getTransactionReceipt(txn_hash)
                if txn_receipt is not None:
                    break
                time.sleep(poll_delay_counter())
                timeout.check()

        return txn_receipt
    return _wait_for_transaction


@pytest.fixture(scope="module")
def eth_tester():
    _eth_tester = EthereumTester(backend=PyEthereum21Backend())
    return _eth_tester


@pytest.fixture(scope="module")
def eth_tester_provider(eth_tester):
    provider = EthereumTesterProvider(eth_tester)
    return provider


@pytest.fixture(scope="module")
def eth_test_seller(eth_tester):
    return eth_tester.get_accounts()[2]


@pytest.fixture(scope="module")
def eth_test_buyer(eth_tester):
    return eth_tester.get_accounts()[3]


@pytest.fixture(scope="module")
def web3(eth_tester_provider):
    _web3 = Web3(eth_tester_provider)
    return _web3


def get_compiled_contract(contract_name):
    """
    Loads a contract's compiled JSON definition.

    Args:
        contract_name(str): name of the contract. Ex: 'UnitListing'

    Returns:
        The contract's JSON.
    """
    filename = "./{}/{}.json".format(TestConfig.CONTRACTS_DIR, contract_name)
    with open(filename) as f:
        contract_interface = json.loads(f.read())
    return contract_interface
