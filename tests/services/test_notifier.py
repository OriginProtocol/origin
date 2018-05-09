from database import db
from database.db_models import EthNotificationEndpoint, EthNotificationTypes
from logic.notifier_service import register_eth_notification
from tests.helpers.eth_utils import sample_eth_address, str_eth
from eth_abi import encode_single
from eth_utils import to_canonical_address

# use indexer to drive notification events
from logic.indexer_service import (new_listing,
                                   listing_purchased,)

def test_new_endpoint(db):
    eth_address = str_eth(sample_eth_address)
    notify_token = "SAMPLE_APN_TOKEN"
    register_eth_notification(eth_address, EthNotificationTypes.APN, notify_token)
    assert(EthNotificationEndpoint.query.filter_by(eth_address = eth_address).count() == 1)

def test_endpoint_notification(db, web3, wait_for_block, wait_for_transaction, listing_registry_contract,
        listing_contract, purchase_contract, mock_ipfs, eth_test_seller, eth_test_buyer):
    buyer_notify_token = "APN_TOKEN_DEVICE_BUYER"
    seller_notify_token = "APN_TOKEN_DEVICE_SELLER"
    seller_address = eth_test_seller
    buyer_address = eth_test_buyer
    register_eth_notification(seller_address, EthNotificationTypes.APN, seller_notify_token)
    register_eth_notification(buyer_address, EthNotificationTypes.APN, buyer_notify_token)
    assert(EthNotificationEndpoint.query.filter_by(eth_address = seller_address).count() == 1)
    assert(EthNotificationEndpoint.query.filter_by(eth_address = buyer_address).count() == 1)

    # HUGE assumption that only one contract have been created...
    print("listing registry contract address:", str_eth(listing_registry_contract_address))
    new_listing({"address":listing_registry_contract.address, "data":"0"}, web3=web3)
    listing_purchased({"address":listing_contract, "data":encode_single("address", to_canonical_address(purchase_contract.address) )}, web3=web3)
