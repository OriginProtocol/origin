from mock import MagicMock

from database.db_models import EthNotificationEndpoint, EthNotificationTypes, EventTracker
from logic.event_handler import EventHandler
from logic.notifier_service import register_eth_notification, notification_messages, Notification
from tests.helpers.eth_utils import sample_eth_address, str_eth
from util.contract import ContractHelper


def test_new_endpoint(db):
    eth_address = str_eth(sample_eth_address)
    notify_token = "SAMPLE_APN_TOKEN"
    register_eth_notification(
        eth_address,
        EthNotificationTypes.APN,
        notify_token)
    assert(EthNotificationEndpoint.query.filter_by(
        eth_address=eth_address).count() == 1)


def test_endpoint_notification(
        db,
        web3,
        wait_for_block,
        wait_for_transaction,
        listing_registry_contract,
        listing_contract,
        purchase_contract,
        mock_ipfs,
        eth_test_seller,
        eth_test_buyer,
        mock_apns,
        mock_fcm):
    buyer_apn_notify_token = "APN_TOKEN_DEVICE_BUYER"
    seller_apn_notify_token = "APN_TOKEN_DEVICE_SELLER"
    seller_address = eth_test_seller
    buyer_address = eth_test_buyer
    register_eth_notification(
        seller_address,
        EthNotificationTypes.APN,
        seller_apn_notify_token)
    register_eth_notification(
        buyer_address,
        EthNotificationTypes.APN,
        buyer_apn_notify_token)
    assert(EthNotificationEndpoint.query.filter_by(
        eth_address=seller_address).count() == 1)
    assert(EthNotificationEndpoint.query.filter_by(
        eth_address=buyer_address).count() == 1)

    buyer_fcm_notify_token = "FCM_REG_ID_DEVICE_BUYER"
    seller_fcm_notify_token = "FCM_REG_ID_DEVICE_SELLER"
    seller_address = eth_test_seller
    buyer_address = eth_test_buyer
    register_eth_notification(
        seller_address,
        EthNotificationTypes.FCM,
        seller_fcm_notify_token)
    register_eth_notification(
        buyer_address,
        EthNotificationTypes.FCM,
        buyer_fcm_notify_token)
    assert(EthNotificationEndpoint.query.filter_by(
        eth_address=seller_address).count() == 2)
    assert(EthNotificationEndpoint.query.filter_by(
        eth_address=buyer_address).count() == 2)

    event_tracker = EventTracker(block_index=0,
                                 transaction_index=0,
                                 log_index=0)
    db.session.add(event_tracker)
    db.session.commit()

    # HUGE assumption that only one contract have been created...
    handler = EventHandler(search_indexer=MagicMock(), web3=web3)
    ContractHelper(web3=web3).fetch_events(
        [],
        block_from=event_tracker.block_index,
        block_to='latest',
        callback=handler.process,
        log_index=event_tracker.log_index,
        transaction_index=event_tracker.transaction_index)

    apn_notification_list = mock_apns.return_value.send_notification.call_args_list
    assert len([1 for b in apn_notification_list if b[0]
                [0] == buyer_apn_notify_token]) == 2
    assert len([1 for b in apn_notification_list if b[0]
                [0] == seller_apn_notify_token]) == 4
    assert apn_notification_list[0][0][1].alert.startswith(
        notification_messages[Notification.LIST][:10])

    fcm_notification_list = mock_fcm.return_value.notify_single_device.call_args_list
    assert len([1 for b in fcm_notification_list if b[1]
                ['registration_id'] == buyer_fcm_notify_token]) == 2
    assert len([1 for b in fcm_notification_list if b[1]
                ['registration_id'] == seller_fcm_notify_token]) == 4
    assert fcm_notification_list[0][1]['message_body'].startswith(
        notification_messages[Notification.LIST][:10])
