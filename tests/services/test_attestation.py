import datetime
import mock
import pytest

from tests.helpers.eth_utils import sample_eth_address, str_eth
from database import db_models
from logic.attestation_service import (VerificationService,
                                       VerificationServiceResponse)
from logic.service_utils import (PhoneVerificationError,
                                 EmailVerificationError,
                                 FacebookVerificationError,
                                 TwitterVerificationError)
from tests.factories.attestation import VerificationCodeFactory
from util.time_ import utcnow
VC = db_models.VerificationCode

SIGNATURE_LENGTH = 132


def test_generate_phone_verification_code_new_phone(
        mock_send_sms, mock_normalize_number):
    phone = '5551231212'
    resp = VerificationService.generate_phone_verification_code(phone)
    assert isinstance(resp, VerificationServiceResponse)

    db_code = VC.query.filter(VC.phone == phone).first()
    assert db_code is not None
    assert db_code.code is not None
    assert len(db_code.code) == 6
    assert db_code.expires_at is not None
    assert db_code.created_at is not None
    assert db_code.updated_at is not None


def test_generate_phone_verification_code_phone_already_in_db(
        mock_send_sms, session, mock_normalize_number):
    vc_obj = VerificationCodeFactory.build()
    expires_at = vc_obj.expires_at
    vc_obj.created_at = utcnow() - datetime.timedelta(seconds=10)
    vc_obj.updated_at = utcnow() - datetime.timedelta(seconds=10)
    session.add(vc_obj)
    session.commit()

    phone = vc_obj.phone
    resp = VerificationService.generate_phone_verification_code(phone)
    assert isinstance(resp, VerificationServiceResponse)

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


def test_generate_phone_verification_code_twilio_exception(
        mock_send_sms_exception, session, mock_normalize_number):
    phone = '5551231212'
    with pytest.raises(PhoneVerificationError) as service_err:
        VerificationService.generate_phone_verification_code(phone)

    assert str(service_err.value) == 'Could not send verification code.'
    db_code = VC.query.filter(VC.phone == phone).first()
    assert db_code is None


def test_verify_phone_valid_code(session, mock_normalize_number):
    vc_obj = VerificationCodeFactory.build()
    session.add(vc_obj)
    session.commit()

    args = {
        'eth_address': str_eth(sample_eth_address),
        'phone': vc_obj.phone,
        'code': vc_obj.code
    }
    resp = VerificationService.verify_phone(**args)
    assert isinstance(resp, VerificationServiceResponse)
    resp_data = resp.data

    assert len(resp_data['signature']) == SIGNATURE_LENGTH
    assert resp_data['claim_type'] == 10
    assert resp_data['data'] == 'phone verified'


def test_verify_phone_expired_code(session, mock_normalize_number):
    vc_obj = VerificationCodeFactory.build()
    vc_obj.expires_at = utcnow() - datetime.timedelta(days=1)
    session.add(vc_obj)
    session.commit()

    args = {
        'eth_address': str_eth(sample_eth_address),
        'phone': vc_obj.phone,
        'code': vc_obj.code
    }
    with pytest.raises(PhoneVerificationError) as service_err:
        VerificationService.verify_phone(**args)

    assert str(service_err.value) == 'The code you provided has expired.'


def test_verify_phone_wrong_code(session, mock_normalize_number):
    vc_obj = VerificationCodeFactory.build()
    session.add(vc_obj)
    session.commit()

    args = {
        'eth_address': str_eth(sample_eth_address),
        'phone': vc_obj.phone,
        'code': 'garbage'
    }
    with pytest.raises(PhoneVerificationError) as service_err:
        VerificationService.verify_phone(**args)

    assert str(service_err.value) == 'The code you provided is invalid.'


def test_verify_phone_phone_not_found(session, mock_normalize_number):
    vc_obj = VerificationCodeFactory.build()
    session.add(vc_obj)
    session.commit()

    args = {
        'eth_address': str_eth(sample_eth_address),
        'phone': 'garbage',
        'code': vc_obj.code
    }
    with pytest.raises(PhoneVerificationError) as service_err:
        VerificationService.verify_phone(**args)

    assert str(service_err.value) == 'The given phone number was not found.'


def test_generate_phone_verification_rate_limit_exceeded(
        session, mock_normalize_number):
    vc_obj = VerificationCodeFactory.build()
    vc_obj.updated_at = utcnow() + datetime.timedelta(seconds=9)
    session.add(vc_obj)
    session.commit()

    phone = vc_obj.phone
    with pytest.raises(PhoneVerificationError) as service_err:
        VerificationService.generate_phone_verification_code(phone)
    assert str(service_err.value) == ('Please wait briefly before requesting a'
                                      ' new verification code.')


@mock.patch('python_http_client.client.Client')
def test_generate_email_verification_code_new_phone(MockHttpClient):
    email = 'hello@world.foo'
    resp = VerificationService.generate_email_verification_code(email)
    assert isinstance(resp, VerificationServiceResponse)

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
    resp = VerificationService.generate_email_verification_code(email)
    assert isinstance(resp, VerificationServiceResponse)

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
    resp_data = resp.data
    assert len(resp_data['signature']) == SIGNATURE_LENGTH
    assert resp_data['claim_type'] == 11
    assert resp_data['data'] == 'email verified'


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
    with pytest.raises(EmailVerificationError) as service_err:
        VerificationService.verify_email(**req)

    assert str(service_err.value) == 'The code you provided has expired.'


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
    with pytest.raises(EmailVerificationError) as service_err:
        VerificationService.verify_email(**req)

    assert str(service_err.value) == 'The code you provided is invalid.'


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
    with pytest.raises(EmailVerificationError) as service_err:
        VerificationService.verify_email(**args)

    assert str(service_err.value) == 'The given email was not found.'


def test_facebook_auth_url():
    redirect_url = 'http://hello.world'
    resp = VerificationService.facebook_auth_url(redirect_url)
    assert isinstance(resp, VerificationServiceResponse)
    resp_data = resp.data
    assert resp_data['url'] == (
        'https://www.facebook.com/v2.12/dialog/oauth?client_id'
        '=facebook-client-id&redirect_uri=http://hello.world/')


@mock.patch('http.client.HTTPSConnection')
def test_verify_facebook_valid_code(MockHttpConnection):
    mock_http_conn = mock.Mock()
    mock_get_response = mock.Mock()
    mock_get_response.read.return_value = '{"access_token": "foo"}'
    mock_http_conn.getresponse.return_value = mock_get_response
    MockHttpConnection.return_value = mock_http_conn
    args = {
        'eth_address': '0x112234455C3a32FD11230C42E7Bccd4A84e02010',
        'redirect_url': 'http://hello.world',
        'code': 'abcde12345'
    }
    resp = VerificationService.verify_facebook(**args)
    assert isinstance(resp, VerificationServiceResponse)
    resp_data = resp.data
    mock_http_conn.request.assert_called_once_with(
        'GET',
        '/v2.12/oauth/access_token?client_id=facebook-client-id&' +
        'client_secret=facebook-client-secret&' +
        'redirect_uri=http://hello.world/&code=abcde12345')
    assert len(resp_data['signature']) == SIGNATURE_LENGTH
    assert resp_data['claim_type'] == 3
    assert resp_data['data'] == 'facebook verified'


@mock.patch('http.client.HTTPSConnection')
def test_verify_facebook_invalid_code(MockHttpConnection):
    mock_http_conn = mock.Mock()
    mock_get_response = mock.Mock()
    mock_get_response.read.return_value = '{"error": "bar"}'
    mock_http_conn.getresponse.return_value = mock_get_response
    MockHttpConnection.return_value = mock_http_conn
    args = {
        'eth_address': '0x112234455C3a32FD11230C42E7Bccd4A84e02010',
        'redirect_url': 'http://hello.world',
        'code': 'bananas'
    }
    with pytest.raises(FacebookVerificationError) as service_err:
        VerificationService.verify_facebook(**args)

    mock_http_conn.request.assert_called_once_with(
        'GET',
        '/v2.12/oauth/access_token?client_id=facebook-client-id' +
        '&client_secret=facebook-client-secret&' +
        'redirect_uri=http://hello.world/&code=bananas')
    assert str(service_err.value) == 'The code you provided is invalid.'


@mock.patch('oauth2.Client')
@mock.patch('logic.attestation_service.session')
def test_twitter_auth_url(mock_session, MockOauthClient):
    mock_oauth_client = mock.Mock()
    mock_oauth_client.request.return_value = {
        'status': '200'}, b'oauth_token=peaches&oauth_token_secret=pears'
    MockOauthClient.return_value = mock_oauth_client
    resp = VerificationService.twitter_auth_url()
    assert isinstance(resp, VerificationServiceResponse)
    resp_data = resp.data
    mock_oauth_client.request.assert_called_once_with(
        'https://api.twitter.com/oauth/request_token', 'GET')
    assert resp_data['url'] == ('https://api.twitter.com/oauth/authenticate?'
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
    assert isinstance(resp, VerificationServiceResponse)
    resp_data = resp.data
    mock_oauth_client.request.assert_called_once_with(
        'https://api.twitter.com/oauth/access_token', 'GET')
    assert len(resp_data['signature']) == SIGNATURE_LENGTH
    assert resp_data['claim_type'] == 4
    assert resp_data['data'] == 'twitter verified'


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
    with pytest.raises(TwitterVerificationError) as service_err:
        VerificationService.verify_twitter(**args)

    mock_oauth_client.request.assert_called_once_with(
        'https://api.twitter.com/oauth/access_token', 'GET')
    assert str(service_err.value) == 'The verifier you provided is invalid.'


@mock.patch('oauth2.Client')
@mock.patch('logic.attestation_service.session')
def test_verify_twitter_invalid_session(mock_session, MockOauthClient):
    args = {
        'eth_address': '0x112234455C3a32FD11230C42E7Bccd4A84e02010',
        'oauth_verifier': 'pineapples'
    }

    with pytest.raises(TwitterVerificationError) as service_err:
        VerificationService.verify_twitter(**args)

    assert str(service_err.value) == 'Session not found.'
