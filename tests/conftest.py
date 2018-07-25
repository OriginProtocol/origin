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


def get_contract_class(web3, contract_name, linked_contracts=[]):
    """
    Returns a contract class. The class can then be used to instantiate
    an object, provided its address.

    Args:
        web3(Web3): web3 object.
        contract_name(str): name of the contract. Ex: 'UnitListing'.
        linked_contract([(str, str)]): Optional. Pair of
            contract's name and address for contract(s) that are linked.

    Returns:
         A web3.eth.contract class.
    """
    compiled_contract = get_compiled_contract(contract_name)

    # If there are any linked contracts, replace the name reference in the
    # contract's bytecode with linked contract's address.
    bytecode = compiled_contract['bytecode']
    for (linked_contract_name, linked_contract_address) in linked_contracts:
        bytecode = bytecode.replace(
            get_contract_internal_name(linked_contract_name),
            linked_contract_address[2:]
        )

    CONTRACT_META = {
        "abi": compiled_contract['abi'],
        "bytecode": bytecode,
    }
    contract_class = web3.eth.contract(**CONTRACT_META)
    return contract_class


@pytest.fixture()
def purchase_lib_contract(web3, wait_for_transaction, wait_for_block):
    """
    Deploys the PurchaseLibrary contract.

    Returns:
        A web3.eth.contract PurchaseLibrary object.
    """
    # Wait for first block to be mined to ensure blockchain back-end is up.
    wait_for_block(web3)

    contract_class = get_contract_class(web3, 'PurchaseLibrary')

    deploy_txn_hash = contract_class\
        .constructor().transact({'from': web3.eth.coinbase})
    deploy_receipt = wait_for_transaction(web3, deploy_txn_hash)

    contract_address = deploy_receipt['contractAddress']
    return contract_class(address=contract_address)


@pytest.fixture()
def listings_registry_storage_contract(
        web3,
        wait_for_transaction,
        wait_for_block):
    """
    Deploys the ListingsRegistryStorage contract.

    Returns:
        A web3.eth.contract ListingsRegistryStorage object.
    """
    # Wait for first block to be mined to ensure blockchain back-end is up.
    wait_for_block(web3)

    contract_class = get_contract_class(web3, 'ListingsRegistryStorage')

    deploy_txn_hash = contract_class\
        .constructor().transact({'from': web3.eth.coinbase})
    deploy_receipt = wait_for_transaction(web3, deploy_txn_hash)

    contract_address = deploy_receipt['contractAddress']
    return contract_class(address=contract_address)


@pytest.fixture()
def listing_registry_contract(
        web3,
        wait_for_transaction,
        wait_for_block,
        purchase_lib_contract,
        listings_registry_storage_contract):
    """
    Deploys the ListingRegistry contract.

    Returns:
        A web3.eth.contract ListingRegistry object.
    """
    # Wait for first block to be mined to ensure blockchain back-end is up.
    wait_for_block(web3)

    contract_class = get_contract_class(
        web3,
        'ListingsRegistry',
        linked_contracts=[('PurchaseLibrary', purchase_lib_contract.address)],
    )

    # Deply the contract.
    deploy_txn_hash = contract_class\
        .constructor(listings_registry_storage_contract.address)\
        .transact({'from': web3.eth.coinbase})
    deploy_receipt = wait_for_transaction(web3, deploy_txn_hash)
    contract_address = deploy_receipt['contractAddress']

    # Set the active registry.
    txn_hash = listings_registry_storage_contract.functions\
        .setActiveRegistry(contract_address)\
        .transact({'from': web3.eth.coinbase})
    wait_for_transaction(web3, txn_hash)

    return contract_class(address=contract_address)


@pytest.fixture()
def listing_contract(
        web3,
        wait_for_transaction,
        wait_for_block,
        purchase_lib_contract,
        listing_registry_contract,
        eth_test_seller):
    """
    Records a new UnitListing.

    Returns:
        A web3.eth.contract UnitListing object.
    """
    # Call the ListingRegistry to add a new UnitListing.
    ipfs_hash = "QmZtQDL4UjQWryQLjsS5JUsbdbn2B27Tmvz2gvLkw7wmmb"
    deploy_txn_hash = \
        listing_registry_contract.functions.create(
            base58_to_hex(ipfs_hash),
            3, 25).transact({'from': eth_test_seller, 'gas': 1000000})
    deploy_receipt = wait_for_transaction(web3, deploy_txn_hash)
    assert deploy_receipt["gasUsed"] > 0

    # Check the listing got added to the registry.
    listings_length = listing_registry_contract.\
        functions.listingsLength().call()
    assert listings_length > 0

    # Create a UnitListing contract object based on address from the registry.
    contract_address = listing_registry_contract.functions.getListingAddress(
        listings_length - 1).call()

    contract_class = get_contract_class(
        web3,
        'UnitListing',
        # Note: this UnitListing contract won't get used for deployment so it
        # is unnecessary to dereference linked contracts in the bytecode.
        # Doing it mainly for consistency with the rest of the code.
        linked_contracts=[('PurchaseLibrary', purchase_lib_contract.address)],
    )
    return contract_class(address=contract_address)


@pytest.fixture()
def purchase_contract(web3, wait_for_transaction, wait_for_block,
                      listing_contract, eth_test_buyer):
    """
    Records a purchase.

    Returns:
        A Pruchase web3.eth.contract object
    """
    contract_class = get_contract_class(web3, 'Purchase')

    deploy_txn_hash = listing_contract.functions.buyListing(
        5).transact({'from': eth_test_buyer})
    deploy_receipt = wait_for_transaction(web3, deploy_txn_hash)
    assert deploy_receipt["gasUsed"] > 0

    # Check the purchase we recorded.
    purchases_length = listing_contract.functions.purchasesLength().call()
    assert purchases_length > 0

    # Get the last listing created and return it.
    contract_address = listing_contract.functions.getPurchase(
        purchases_length - 1).call()
    return contract_class(address=contract_address)


@pytest.fixture()
def purchase_stage_awaiting_payment(web3, wait_for_transaction,
                                    wait_for_block,
                                    purchase_contract,
                                    eth_test_buyer):
    # add payment to the purchase to move the stage forward
    deploy_txn_hash = \
        purchase_contract.functions.pay().transact({'from': eth_test_buyer,
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
        .transact({'from': eth_test_seller})
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
        .transact({'from': eth_test_buyer})
    deploy_receipt = wait_for_transaction(web3, deploy_txn_hash)
    assert deploy_receipt["gasUsed"] > 0

    return purchase_contract
