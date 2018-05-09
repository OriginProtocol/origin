from database import db
from database.db_models import EthNotificationEndpoint, EthNotificationTypes, EventTracker
from logic.notifier_service import register_eth_notification, notification_messages, Notification
from tests.helpers.eth_utils import sample_eth_address, str_eth
from util.contract import ContractHelper
from eth_abi import encode_single
from eth_utils import to_canonical_address

# use indexer to drive notification events
from logic.indexer_service import event_reducer

def test_new_endpoint(db):
    eth_address = str_eth(sample_eth_address)
    notify_token = "SAMPLE_APN_TOKEN"
    register_eth_notification(eth_address, EthNotificationTypes.APN, notify_token)
    assert(EthNotificationEndpoint.query.filter_by(eth_address = eth_address).count() == 1)

def test_endpoint_notification(db, web3, wait_for_block, wait_for_transaction, listing_registry_contract,
        listing_contract, purchase_contract, mock_ipfs, eth_test_seller, eth_test_buyer, mock_apns):
    buyer_notify_token = "APN_TOKEN_DEVICE_BUYER"
    seller_notify_token = "APN_TOKEN_DEVICE_SELLER"
    seller_address = eth_test_seller
    buyer_address = eth_test_buyer
    register_eth_notification(seller_address, EthNotificationTypes.APN, seller_notify_token)
    register_eth_notification(buyer_address, EthNotificationTypes.APN, buyer_notify_token)
    assert(EthNotificationEndpoint.query.filter_by(eth_address = seller_address).count() == 1)
    assert(EthNotificationEndpoint.query.filter_by(eth_address = buyer_address).count() == 1)

    event_tracker = EventTracker(last_read=0)
    db.session.add(event_tracker)
    db.session.commit()

    # HUGE assumption that only one contract have been created...
    ContractHelper(web3).fetch_events([],
        block_from=event_tracker.last_read,
        block_to='latest',
        f=event_reducer,
        web3=web3)

    notification_list = mock_apns.return_value.send_notification.call_args_list
    assert len([1 for b in notification_list if b[0][0] == buyer_notify_token]) == 1
    assert len([1 for b in notification_list if b[0][0] == seller_notify_token]) == 3
    assert notification_list[0][0][1].alert.startswith(notification_messages[Notification.LIST][:10])
    #import pdb;pdb.set_trace() 

