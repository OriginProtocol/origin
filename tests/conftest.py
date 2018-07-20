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

from util.contract import get_contract_internal_name
from util.ipfs import base58_to_hex


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


@pytest.fixture()
def purchase_lib_contract(web3, wait_for_transaction, wait_for_block):
    contract_name = 'PurchaseLibrary'
    with open("./contracts/{}.json".format(contract_name)) as f:
        contract_interface = json.loads(f.read())
    wait_for_block(web3)

    CONTRACT_META = {
        "abi": contract_interface['abi'],
        "bytecode": contract_interface['bytecode']
    }

    contract = web3.eth.contract(**CONTRACT_META)
    deploy_txn_hash = contract\
        .constructor().transact({'from': web3.eth.coinbase,
                                 'gas': 1000000})
    deploy_receipt = wait_for_transaction(web3, deploy_txn_hash)
    contract_address = deploy_receipt['contractAddress']
    return contract(address=contract_address)


@pytest.fixture()
def listing_registry_contract(web3, wait_for_transaction, wait_for_block,
                              purchase_lib_contract):
    contract_name = 'ListingsRegistry'
    linked_contract = 'PurchaseLibrary'
    with open("./contracts/{}.json".format(contract_name)) as f:
        contract_interface = json.loads(f.read())
    wait_for_block(web3)

    CONTRACT_META = {
        "abi": contract_interface['abi'],
        "bytecode": contract_interface['bytecode'].replace(
            get_contract_internal_name(linked_contract),
            purchase_lib_contract.address[2:]
        )
    }

    contract = web3.eth.contract(**CONTRACT_META)
    deploy_txn_hash = contract.constructor()\
        .transact({'from': web3.eth.coinbase, 'gas': 1000000})
    deploy_receipt = wait_for_transaction(web3, deploy_txn_hash)
    contract_address = deploy_receipt['contractAddress']
    return contract(address=contract_address)


@pytest.fixture()
def listing_contract(
        web3,
        wait_for_transaction,
        wait_for_block,
        purchase_lib_contract,
        listing_registry_contract,
        eth_test_seller):
    contract_name = 'UnitListing'
    with open("./contracts/{}.json".format(contract_name)) as f:
        contract_interface = json.loads(f.read())
    wait_for_block(web3)

    CONTRACT_META = {
        "abi": contract_interface['abi']
    }

    contract = web3.eth.contract(**CONTRACT_META)
    ipfs_hash = "QmZtQDL4UjQWryQLjsS5JUsbdbn2B27Tmvz2gvLkw7wmmb"
    deploy_txn_hash = \
        listing_registry_contract.functions.create(
            base58_to_hex(ipfs_hash),
            3, 25).transact({'from': eth_test_seller,
                             'gas': 1000000})
    deploy_receipt = wait_for_transaction(web3, deploy_txn_hash)
    assert deploy_receipt["gasUsed"] > 0
    # we better have created one of these
    listings_length = listing_registry_contract.functions.listingsLength().call()
    assert listings_length > 0
    # get the last listing created
    contract_address = listing_registry_contract.functions.getListing(
        listings_length - 1).call()[0]
    return contract(address=contract_address)


@pytest.fixture()
def purchase_contract(web3, wait_for_transaction, wait_for_block,
                      listing_contract, eth_test_buyer):
    contract_name = 'Purchase'
    with open("./contracts/{}.json".format(contract_name)) as f:
        contract_interface = json.loads(f.read())
    wait_for_block(web3)

    CONTRACT_META = {
        "abi": contract_interface['abi'],
        # "bytecode": contract_interface['bytecode']
    }

    contract = web3.eth.contract(**CONTRACT_META)
    deploy_txn_hash = listing_contract.functions.buyListing(
        5).transact({'from': eth_test_buyer, 'gas': 1000000})
    deploy_receipt = wait_for_transaction(web3, deploy_txn_hash)
    assert deploy_receipt["gasUsed"] > 0
    # we better have created one of these
    purchases_length = listing_contract.functions.purchasesLength().call()
    assert purchases_length > 0
    # get the last listing created
    contract_address = listing_contract.functions.getPurchase(
        purchases_length - 1).call()
    return contract(address=contract_address)


@pytest.fixture()
def purchase_stage_awaiting_payment(web3, wait_for_transaction,
                                    wait_for_block,
                                    purchase_contract,
                                    eth_test_buyer):
    # add payment to the purchase to move the stage forward
    deploy_txn_hash = \
        purchase_contract.functions.pay().transact({'from': eth_test_buyer,
                                                    'gas': 1000000,
                                                    'value': 25})
    deploy_receipt = wait_for_transaction(web3, deploy_txn_hash)
    assert deploy_receipt["gasUsed"] > 0
    return purchase_contract


@pytest.fixture()
def purchase_stage_shipping_pending(web3, wait_for_transaction, wait_for_block,
                                    purchase_stage_awaiting_payment,
                                    eth_test_seller):

    purchase_contract = purchase_stage_awaiting_payment
    # confirm shipping to move the stage forward
    deploy_txn_hash = \
        purchase_contract.functions.sellerConfirmShipped()\
        .transact({'from': eth_test_seller, 'gas': 1000000})
    deploy_receipt = wait_for_transaction(web3, deploy_txn_hash)
    assert deploy_receipt["gasUsed"] > 0

    return purchase_contract


@pytest.fixture()
def purchase_stage_buyer_pending(web3, wait_for_transaction, wait_for_block,
                                 purchase_stage_shipping_pending,
                                 eth_test_buyer):

    purchase_contract = purchase_stage_shipping_pending
    # confirm receipt to move the stage forward, this is the Stage
    # where the review event would be emitted
    ipfs_hash = base58_to_hex("QmZtQDL4UjQWryQLjsS5JUsbdbn2B27Tmvz2gvLkw7wmmb")
    deploy_txn_hash = \
        purchase_contract.functions.buyerConfirmReceipt(2, ipfs_hash)\
        .transact({'from': eth_test_buyer, 'gas': 1000000})
    deploy_receipt = wait_for_transaction(web3, deploy_txn_hash)
    assert deploy_receipt["gasUsed"] > 0

    return purchase_contract
