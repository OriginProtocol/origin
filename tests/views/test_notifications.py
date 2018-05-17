from tests.helpers.rest_utils import post_json, json_of_response
from tests.helpers.eth_utils import sample_eth_address, str_eth


def test_notification_eth_register(client):
    resp = post_json(client,
                     "/api/notifications/eth-endpoint",
                     {"eth_address": str_eth(sample_eth_address),
                      "device_token": "APN_DEVICE_TOKEN",
                      "type": "APN"})
    assert resp.status_code == 200
    assert json_of_response(resp) == {}
