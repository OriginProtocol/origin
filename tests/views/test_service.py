import json
from views import service_views # noqa


def test_verification_service(mock_send_sms, client):
    payload = {'eth_address': '0x123', 'phone': '5551231212'}
    resp = client.post('/api/verification_service/generate_phone_verification_code',
                       data=json.dumps(payload),
                       content_type='application/json')
    assert resp.status_code == 200