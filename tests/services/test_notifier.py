from database.db_models import EthNotificationEndpoint, EthNotificationTypes
from logic.notifier_service import register_eth_notification
from tests.helpers.eth_utils import sample_eth_address, str_eth


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
