from database.db_models import EthNotificationEndpoint, EthNotificationTypes
from logic.indexer_service import register_eth_notification
from tests.helpers.eth_utils import sample_eth_address, str_eth

def test_new_endpoint(db):
    eth_address = str_eth(sample_eth_address)
    notify_token = "SAMPLE_APN_TOKEN"
    register_eth_notification(eth_address, EthNotificationTypes.APN, notify_token)
    assert(EthNotificationEndpoint.query.filter_by(eth_address = eth_address).count() == 1)
