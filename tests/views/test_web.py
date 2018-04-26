from views import web_views  # noqa
import mock

from tests.helpers.rest_utils import post_json, json_of_response
from tests.helpers.eth_utils import sample_eth_address, str_eth


from database import db_models
VC = db_models.VerificationCode


def test_index(client):
    resp = client.get('/')
    assert resp.status_code == 200


def test_phone_verify(client, mock_send_sms):
    phone = "6666666666"
    resp = post_json(client,
                     "/api/attestations/phone/generate-code",
                     {"phone": phone})
    assert resp.status_code == 200
    assert json_of_response(resp) == {}

    db_code = VC.query.filter(VC.phone == phone).first()
    assert db_code.code is not None

    resp = post_json(client,
                     "/api/attestations/phone/verify",
                     {"phone": phone,
                      "identity": str_eth(sample_eth_address),
                      'code': db_code.code})
    print(json_of_response(resp))
    assert resp.status_code == 200
    assert json_of_response(resp)['data'] == 'phone verified'


@mock.patch('python_http_client.client.Client')
def test_email_verify(MockHttpClient, client):
    email = 'test@dumb.bo'
    resp = post_json(client,
                     "/api/attestations/email/generate-code",
                     {"email": email})

    db_code = VC.query.filter(VC.email == email).first()
    assert db_code.code is not None

    resp = post_json(client,
                     "/api/attestations/email/verify",
                     {"email": email,
                      "identity": str_eth(sample_eth_address),
                      'code': db_code.code})
    print(json_of_response(resp))
    assert resp.status_code == 200
    assert json_of_response(resp)['data'] == 'email verified'
