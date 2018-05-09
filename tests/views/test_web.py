from views import web_views  # noqa
import mock

from tests.helpers.rest_utils import post_json, json_of_response
from tests.helpers.eth_utils import sample_eth_address, str_eth


from database import db_models
VC = db_models.VerificationCode


def test_index(client):
    resp = client.get('/')
    assert resp.status_code == 200


def test_phone_verify(client, mock_send_sms, mock_normalize_number):
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
    resp_json = json_of_response(resp)
    assert resp.status_code == 200
    assert len(resp_json['signature']) == 132
    assert resp_json['data'] == 'phone verified'


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
    resp_json = json_of_response(resp)
    assert resp.status_code == 200
    assert len(resp_json['signature']) == 132
    assert resp_json['data'] == 'email verified'


@mock.patch("http.client.HTTPSConnection")
def test_facebook_verify(MockHttpConnection, client):
    mock_http_conn = mock.Mock()
    mock_get_response = mock.Mock()
    mock_get_response.read.return_value = '{"access_token": "foo"}'
    mock_http_conn.getresponse.return_value = mock_get_response
    MockHttpConnection.return_value = mock_http_conn

    resp = client.get(
        "/api/attestations/facebook/auth-url")
    expected_url = ("?client_id=facebook-client-id&redirect_uri"
                    "=http://testhost.com/redirects/facebook/")
    assert resp.status_code == 200
    assert expected_url in json_of_response(resp)['url']

    resp = post_json(client,
                     "/api/attestations/facebook/verify",
                     {"identity": str_eth(sample_eth_address),
                      "code": "abcde12345"})
    resp_json = json_of_response(resp)
    assert resp.status_code == 200
    assert len(resp_json['signature']) == 132
    assert resp_json['data'] == 'facebook verified'


@mock.patch('oauth2.Client')
def test_twitter_verify(MockOauthClient, client):
    mock_oauth_client = mock.Mock()
    mock_oauth_client.request.return_value = {
        'status': '200'}, b'oauth_token=peaches&oauth_token_secret=pears'
    MockOauthClient.return_value = mock_oauth_client

    resp = client.get(
        "/api/attestations/twitter/auth-url")
    expected_url = "oauth_token=peaches"
    assert resp.status_code == 200
    assert expected_url in json_of_response(resp)['url']

    resp = post_json(client,
                     "/api/attestations/twitter/verify",
                     {"identity": str_eth(sample_eth_address),
                      "oauth-verifier": "abcde12345"})
    resp_json = json_of_response(resp)
    assert resp.status_code == 200
    assert len(resp_json['signature']) == 132
    assert resp_json['data'] == 'twitter verified'
