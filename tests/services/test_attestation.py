import datetime
import mock
import pytest

from tests.helpers.eth_utils import sample_eth_address, str_eth
from database import db_models
from logic.attestation_service import VerificationService
from logic.service_utils import ServiceError
from tests.factories.attestation import VerificationCodeFactory
from util.time_ import utcnow
VC = db_models.VerificationCode

SIGNATURE_LENGTH = 132


def test_generate_phone_verification_code_new_phone(mock_send_sms):
    phone = '5551231212'
    VerificationService.generate_phone_verification_code(phone)

    db_code = VC.query.filter(VC.phone == phone).first()
    assert db_code is not None
    assert db_code.code is not None
    assert len(db_code.code) == 6
    assert db_code.expires_at is not None
    assert db_code.created_at is not None
    assert db_code.updated_at is not None


def test_generate_phone_verification_code_phone_already_in_db(
        mock_send_sms, session):
    vc_obj = VerificationCodeFactory.build()
    expires_at = vc_obj.expires_at
    vc_obj.created_at = utcnow() - datetime.timedelta(seconds=10)
    vc_obj.updated_at = utcnow() - datetime.timedelta(seconds=10)
    session.add(vc_obj)
    session.commit()

    phone = vc_obj.phone
    VerificationService.generate_phone_verification_code(phone)

    assert VC.query.filter(VC.phone == phone).count() == 1

    db_code = VC.query.filter(VC.phone == phone).first()
    assert db_code is not None
    assert db_code.code is not None
    assert len(db_code.code) == 6
    assert db_code.expires_at is not None
    assert db_code.created_at is not None
    assert db_code.updated_at is not None
    assert db_code.updated_at >= db_code.created_at
    assert db_code.expires_at > expires_at


def test_verify_phone_valid_code(session):
    vc_obj = VerificationCodeFactory.build()
    session.add(vc_obj)
    session.commit()

    args = {
        'eth_address': str_eth(sample_eth_address),
        'phone': vc_obj.phone,
        'code': vc_obj.code
    }
    resp = VerificationService.verify_phone(**args)

    assert len(resp['signature']) == SIGNATURE_LENGTH
    assert resp['claim_type'] == 10
    assert resp['data'] == 'phone verified'


def test_verify_phone_expired_code(session):
    vc_obj = VerificationCodeFactory.build()
    vc_obj.expires_at = utcnow() - datetime.timedelta(days=1)
    session.add(vc_obj)
    session.commit()

    args = {
        'eth_address': str_eth(sample_eth_address),
        'phone': vc_obj.phone,
        'code': vc_obj.code
    }
    with pytest.raises(ServiceError) as service_err:
        VerificationService.verify_phone(**args)
    code = service_err.value.args[0]['code']
    message = service_err.value.args[0]['message']
    path = service_err.value.args[0]['path']

    assert message == 'The code you provided has expired.'
    assert code == 'EXPIRED'
    assert path == 'code'


def test_verify_phone_wrong_code(session):
    vc_obj = VerificationCodeFactory.build()
    session.add(vc_obj)
    session.commit()

    args = {
        'eth_address': str_eth(sample_eth_address),
        'phone': vc_obj.phone,
        'code': 'garbage'
    }
    with pytest.raises(ServiceError) as service_err:
        VerificationService.verify_phone(**args)
    code = service_err.value.args[0]['code']
    message = service_err.value.args[0]['message']
    path = service_err.value.args[0]['path']

    assert message == 'The code you provided is invalid.'
    assert code == 'INVALID'
    assert path == 'code'


def test_verify_phone_phone_not_found(session):
    vc_obj = VerificationCodeFactory.build()
    session.add(vc_obj)
    session.commit()

    args = {
        'eth_address': str_eth(sample_eth_address),
        'phone': 'garbage',
        'code': vc_obj.code
    }
    with pytest.raises(ServiceError) as service_err:
        VerificationService.verify_phone(**args)
    code = service_err.value.args[0]['code']
    message = service_err.value.args[0]['message']
    path = service_err.value.args[0]['path']

    assert message == 'The given phone number was not found.'
    assert code == 'NOT_FOUND'
    assert path == 'phone'


def test_generate_phone_verification_rate_limit_exceeded(session):
    vc_obj = VerificationCodeFactory.build()
    vc_obj.updated_at = utcnow() + datetime.timedelta(seconds=9)
    session.add(vc_obj)
    session.commit()

    phone = vc_obj.phone
    with pytest.raises(ServiceError) as service_err:
        VerificationService.generate_phone_verification_code(phone)
    code = service_err.value.args[0]['code']
    message = service_err.value.args[0]['message']
    path = service_err.value.args[0]['path']

    assert code == 'RATE_LIMIT_EXCEEDED'
    assert path is None
    assert message == ('Please wait briefly before requesting a'
                       ' new verification code.')


@mock.patch('python_http_client.client.Client')
def test_generate_email_verification_code_new_phone(MockHttpClient):
    email = 'hello@world.foo'
    VerificationService.generate_email_verification_code(email)

    db_code = VC.query.filter(VC.email == email).first()
    assert db_code is not None
    assert db_code.code is not None
    assert 6 == len(db_code.code)
    assert db_code.expires_at is not None
    assert db_code.created_at is not None
    assert db_code.updated_at is not None


@mock.patch('python_http_client.client.Client')
def test_generate_email_verification_code_email_already_in_db(
        MockHttpClient, session):
    vc_obj = VerificationCodeFactory.build()
    expires_at = vc_obj.expires_at
    vc_obj.created_at = utcnow() - datetime.timedelta(seconds=10)
    vc_obj.updated_at = utcnow() - datetime.timedelta(seconds=10)
    session.add(vc_obj)
    session.commit()

    email = vc_obj.email
    VerificationService.generate_email_verification_code(email)

    assert VC.query.filter(VC.email == email).count() == 1
    db_code = VC.query.filter(VC.email == email).first()
    assert db_code is not None
    assert db_code.code is not None
    assert len(db_code.code) == 6
    assert db_code.expires_at is not None
    assert db_code.created_at is not None
    assert db_code.updated_at is not None
    assert db_code.updated_at >= db_code.created_at
    assert db_code.expires_at > expires_at


@mock.patch('util.time_.utcnow')
def test_verify_email_valid_code(mock_now, session):
    vc_obj = VerificationCodeFactory.build()
    session.add(vc_obj)
    session.commit()

    req = {
        'eth_address': str_eth(sample_eth_address),
        'email': vc_obj.email.upper(),
        'code': vc_obj.code
    }
    mock_now.return_value = vc_obj.expires_at - datetime.timedelta(minutes=1)
    resp = VerificationService.verify_email(**req)
    assert len(resp['signature']) == SIGNATURE_LENGTH
    assert resp['claim_type'] == 11
    assert resp['data'] == 'email verified'


@mock.patch('util.time_.utcnow')
def test_verify_email_expired_code(mock_now, session):
    vc_obj = VerificationCodeFactory.build()
    session.add(vc_obj)
    session.commit()

    req = {
        'eth_address': str_eth(sample_eth_address),
        'email': vc_obj.email,
        'code': vc_obj.code
    }
    mock_now.return_value = vc_obj.expires_at + datetime.timedelta(minutes=1)
    with pytest.raises(ServiceError) as service_err:
        VerificationService.verify_email(**req)
    code = service_err.value.args[0]['code']
    message = service_err.value.args[0]['message']
    path = service_err.value.args[0]['path']

    assert code == 'EXPIRED'
    assert path == 'code'
    assert message == 'The code you provided has expired.'


@mock.patch('util.time_.utcnow')
def test_verify_email_wrong_code(mock_now, session):
    vc_obj = VerificationCodeFactory.build()
    session.add(vc_obj)
    session.commit()

    req = {
        'eth_address': str_eth(sample_eth_address),
        'email': vc_obj.email,
        'code': 'garbage'
    }
    mock_now.return_value = vc_obj.expires_at - datetime.timedelta(minutes=1)
    with pytest.raises(ServiceError) as service_err:
        VerificationService.verify_email(**req)
    code = service_err.value.args[0]['code']
    message = service_err.value.args[0]['message']
    path = service_err.value.args[0]['path']

    assert code == 'INVALID'
    assert path == 'code'
    assert message == 'The code you provided is invalid.'


@mock.patch('util.time_.utcnow')
def test_verify_email_email_not_found(mock_now, session):
    vc_obj = VerificationCodeFactory.build()
    session.add(vc_obj)
    session.commit()

    args = {
        'eth_address': str_eth(sample_eth_address),
        'email': 'garbage',
        'code': vc_obj.code
    }
    mock_now.return_value = vc_obj.expires_at - datetime.timedelta(minutes=1)
    with pytest.raises(ServiceError) as service_err:
        VerificationService.verify_email(**args)
    code = service_err.value.args[0]['code']
    message = service_err.value.args[0]['message']
    path = service_err.value.args[0]['path']

    assert code == 'NOT_FOUND'
    assert path == 'email'
    assert message == 'The given email was not found.'


def test_facebook_auth_url():
    resp = VerificationService.facebook_auth_url()
    assert resp['url'] == (
        'https://www.facebook.com/v2.12/dialog/oauth?client_id'
        '=facebook-client-id&redirect_uri'
        '=http://testhost.com/redirects/facebook/')


@mock.patch('http.client.HTTPSConnection')
def test_verify_facebook_valid_code(MockHttpConnection):
    mock_http_conn = mock.Mock()
    mock_get_response = mock.Mock()
    mock_get_response.read.return_value = '{"access_token": "foo"}'
    mock_http_conn.getresponse.return_value = mock_get_response
    MockHttpConnection.return_value = mock_http_conn
    args = {
        'eth_address': '0x112234455C3a32FD11230C42E7Bccd4A84e02010',
        'code': 'abcde12345'
    }
    resp = VerificationService.verify_facebook(**args)
    mock_http_conn.request.assert_called_once_with(
        'GET',
        '/v2.12/oauth/access_token?client_id=facebook-client-id&' +
        'client_secret=facebook-client-secret&' +
        'redirect_uri=http://testhost.com/redirects/facebook/&code=abcde12345')
    assert len(resp['signature']) == SIGNATURE_LENGTH
    assert resp['claim_type'] == 3
    assert resp['data'] == 'facebook verified'


@mock.patch('http.client.HTTPSConnection')
def test_verify_facebook_invalid_code(MockHttpConnection):
    mock_http_conn = mock.Mock()
    mock_get_response = mock.Mock()
    mock_get_response.read.return_value = '{"error": "bar"}'
    mock_http_conn.getresponse.return_value = mock_get_response
    MockHttpConnection.return_value = mock_http_conn
    args = {
        'eth_address': '0x112234455C3a32FD11230C42E7Bccd4A84e02010',
        'code': 'bananas'
    }
    with pytest.raises(ServiceError) as service_err:
        VerificationService.verify_facebook(**args)
    code = service_err.value.args[0]['code']
    message = service_err.value.args[0]['message']
    path = service_err.value.args[0]['path']

    mock_http_conn.request.assert_called_once_with(
        'GET',
        '/v2.12/oauth/access_token?client_id=facebook-client-id' +
        '&client_secret=facebook-client-secret&' +
        'redirect_uri=http://testhost.com/redirects/facebook/&code=bananas')
    assert code == 'INVALID'
    assert path == 'code'
    assert message == 'The code you provided is invalid.'


@mock.patch('oauth2.Client')
@mock.patch('logic.attestation_service.session')
def test_twitter_auth_url(mock_session, MockOauthClient):
    mock_oauth_client = mock.Mock()
    mock_oauth_client.request.return_value = {
        'status': '200'}, b'oauth_token=peaches&oauth_token_secret=pears'
    MockOauthClient.return_value = mock_oauth_client
    resp = VerificationService.twitter_auth_url()
    mock_oauth_client.request.assert_called_once_with(
        'https://api.twitter.com/oauth/request_token', 'GET')
    assert resp['url'] == ('https://api.twitter.com/oauth/authenticate?'
                           'oauth_token=peaches')


@mock.patch('oauth2.Client')
@mock.patch('logic.attestation_service.session')
def test_verify_twitter_valid_code(mock_session, MockOauthClient):
    dict = {'request_token': 'bar'}
    mock_session.__contains__.side_effect = dict.__contains__
    mock_oauth_client = mock.Mock()
    mock_oauth_client.request.return_value = {
        'status': '200'}, b'oauth_token=guavas&oauth_token_secret=mangos'
    MockOauthClient.return_value = mock_oauth_client
    args = {
        'eth_address': '0x112234455C3a32FD11230C42E7Bccd4A84e02010',
        'oauth_verifier': 'blueberries'
    }
    resp = VerificationService.verify_twitter(**args)
    mock_oauth_client.request.assert_called_once_with(
        'https://api.twitter.com/oauth/access_token', 'GET')
    assert len(resp['signature']) == SIGNATURE_LENGTH
    assert resp['claim_type'] == 4
    assert resp['data'] == 'twitter verified'


@mock.patch('oauth2.Client')
@mock.patch('logic.attestation_service.session')
def test_verify_twitter_invalid_verifier(mock_session, MockOauthClient):
    dict = {'request_token': 'bar'}
    mock_session.__contains__.side_effect = dict.__contains__
    mock_oauth_client = mock.Mock()
    mock_oauth_client.request.return_value = {'status': '401'}, b''
    MockOauthClient.return_value = mock_oauth_client
    args = {
        'eth_address': '0x112234455C3a32FD11230C42E7Bccd4A84e02010',
        'oauth_verifier': 'pineapples'
    }
    with pytest.raises(ServiceError) as service_err:
        VerificationService.verify_twitter(**args)
    code = service_err.value.args[0]['code']
    message = service_err.value.args[0]['message']
    path = service_err.value.args[0]['path']

    mock_oauth_client.request.assert_called_once_with(
        'https://api.twitter.com/oauth/access_token', 'GET')
    assert code == 'INVALID'
    assert path == 'oauth_verifier'
    assert message == 'The verifier you provided is invalid.'


@mock.patch('oauth2.Client')
@mock.patch('logic.attestation_service.session')
def test_verify_twitter_invalid_session(mock_session, MockOauthClient):
    args = {
        'eth_address': '0x112234455C3a32FD11230C42E7Bccd4A84e02010',
        'oauth_verifier': 'pineapples'
    }

    with pytest.raises(ServiceError) as service_err:
        VerificationService.verify_twitter(**args)
    code = service_err.value.args[0]['code']
    message = service_err.value.args[0]['message']

    assert code == 'INVALID'
    assert message == 'Session not found.'
