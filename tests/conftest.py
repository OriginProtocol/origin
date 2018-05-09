import pytest
import time
import json

from web3.providers.eth_tester import (
    EthereumTesterProvider,
)

from eth_tester import (
    EthereumTester,
    PyEthereum16Backend
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

    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ECHO = False

    TESTING = True
    SERVER_NAME = 'localhost'
    CREATE_DEFAULT_APP_CONTEXT = True

    # Temporary workaroudn for https://github.com/pallets/flask/issues/2549
    JSONIFY_PRETTYPRINT_REGULAR = False


@pytest.yield_fixture(scope='session')
def app():
    _app = flask_app
    _app.config.from_object(__name__ + '.TestConfig')
    init_api(_app)
    with Postgresql() as postgresql:
        _app.config['SQLALCHEMY_DATABASE_URI'] = postgresql.url()
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
def mock_send_sms(app):
    patcher = patch('logic.attestation_service.send_code_via_sms',
                    return_value=True)
    yield patcher.start()
    patcher.stop()


@pytest.yield_fixture(scope='function')
def mock_ipfs_init(app):
    patcher = patch('util.ipfs.IPFSHelper.__init__',
                    return_value=None)

    yield patcher.start()
    patcher.stop()


@pytest.yield_fixture(scope='function')
def mock_ipfs(app, mock_ipfs_init):
    with open("./tests/ipfs/sample.json") as f:
        ipfs_data = json.loads(f.read())
    patcher = patch('util.ipfs.IPFSHelper.file_from_hash',
                    return_value=ipfs_data)
    yield patcher.start()
    patcher.stop()


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
    _eth_tester = EthereumTester(backend=PyEthereum16Backend())
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
def listing_contract(web3, wait_for_transaction, wait_for_block,
                     purchase_lib_contract, listing_registry_contract, eth_test_seller):
    contract_name = 'Listing'
    linked_contract = 'PurchaseLibrary'
    with open("./contracts/{}.json".format(contract_name)) as f:
        contract_interface = json.loads(f.read())
    wait_for_block(web3)

    CONTRACT_META = {
        "abi": contract_interface['abi'],
        #"bytecode": contract_interface['bytecode'].replace(
        #    get_contract_internal_name(linked_contract),
        #    purchase_lib_contract.address[2:],
        #)
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
    #we better have created one of these
    listings_length = listing_registry_contract.functions.listingsLength().call()
    assert listings_length > 0 
    #get the last listing created
    contract_address = listing_registry_contract.functions.getListing(listings_length-1).call()[0]
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
        #"bytecode": contract_interface['bytecode']
    }

    contract = web3.eth.contract(**CONTRACT_META)
    deploy_txn_hash = \
        listing_contract.functions.buyListing( 5
                             ).transact({'from': eth_test_buyer,
                                         'gas': 1000000})
    deploy_receipt = wait_for_transaction(web3, deploy_txn_hash)
    assert deploy_receipt["gasUsed"] > 0
    #we better have created one of these
    purchases_length = listing_contract.functions.purchasesLength().call()
    assert purchases_length > 0 
    #get the last listing created
    contract_address = listing_contract.functions.getPurchase(purchases_length-1).call()
    return contract(address=contract_address)
