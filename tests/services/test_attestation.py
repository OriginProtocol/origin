import datetime
import mock
import pytest

import responses
from urllib.request import HTTPError
from tests.helpers.eth_utils import sample_eth_address, str_eth
from database import db_models
from logic.attestation_service import (VerificationService,
                                       VerificationServiceResponse)
from logic.attestation_service import CLAIM_TYPES
from logic.service_utils import (PhoneVerificationError,
                                 EmailVerificationError,
                                 FacebookVerificationError,
                                 TwitterVerificationError,
                                 AirbnbVerificationError)
from marshmallow.exceptions import ValidationError
from tests.factories.attestation import VerificationCodeFactory
from util.time_ import utcnow
VC = db_models.VerificationCode

SIGNATURE_LENGTH = 132


@responses.activate
def test_send_phone_verification_success():
    responses.add(
        responses.POST,
        'https://api.authy.com/protected/json/phones/verification/start',
        status=200
    )

    args = {
        'country_calling_code': '1',
        'phone': '12341234',
        'method': 'sms',
        'locale': None
    }
    response = VerificationService.send_phone_verification(**args)
    assert isinstance(response, VerificationServiceResponse)


@responses.activate
def test_send_phone_verification_invalid_number():
    responses.add(
        responses.POST,
        'https://api.authy.com/protected/json/phones/verification/start',
        json={'error_code': '60033'},
        status=400
    )

    args = {
        'country_calling_code': '1',
        'phone': '1234',
        'method': 'sms',
        'locale': None
    }
    with pytest.raises(ValidationError) as validation_err:
        VerificationService.send_phone_verification(**args)

    assert(validation_err.value.messages[0]) == 'Phone number is invalid.'
    assert(validation_err.value.field_names[0]) == 'phone'


@responses.activate
def test_send_phone_verification_cant_sms_landline():
    responses.add(
        responses.POST,
        'https://api.authy.com/protected/json/phones/verification/start',
        json={'error_code': '60082'},
        status=403
    )

    args = {
        'country_calling_code': '1',
        'phone': '1234',
        'method': 'sms',
        'locale': None
    }
    with pytest.raises(ValidationError) as validation_err:
        VerificationService.send_phone_verification(**args)

    assert(validation_err.value.messages[0]) == 'Cannot send SMS to landline.'
    assert(validation_err.value.field_names[0]) == 'phone'


@responses.activate
def test_send_phone_verification_twilio_error():
    responses.add(
        responses.POST,
        'https://api.authy.com/protected/json/phones/verification/start',
        json={'error_code': '60060'},  # Account is suspended
        status=503
    )

    args = {
        'country_calling_code': '1',
        'phone': '1234',
        'method': 'sms',
        'locale': None
    }
    with pytest.raises(PhoneVerificationError) as service_err:
        VerificationService.send_phone_verification(**args)

    assert(str(service_err.value)) == \
        'Could not send verification code. Please try again shortly.'


@responses.activate
def test_verify_phone_valid_code():
    responses.add(
        responses.GET,
        'https://api.authy.com/protected/json/phones/verification/status',
        json={
            'message': 'Verification code is correct.',
            'success': True
        }
    )

    args = {
        'eth_address': str_eth(sample_eth_address),
        'country_calling_code': '1',
        'phone': '12341234',
        'code': '123456'
    }
    response = VerificationService.verify_phone(**args)
    assert isinstance(response, VerificationServiceResponse)

    assert len(response.data['signature']) == SIGNATURE_LENGTH
    assert response.data['claim_type'] == CLAIM_TYPES['phone']
    assert response.data['data'] == 'phone verified'


@responses.activate
def test_verify_phone_expired_code():
    responses.add(
        responses.GET,
        'https://api.authy.com/protected/json/phones/verification/status',
        json={'error_code': '60023'},   # No pending verification
        status=404
    )

    args = {
        'eth_address': str_eth(sample_eth_address),
        'country_calling_code': '1',
        'phone': '12341234',
        'code': '123456'
    }
    with pytest.raises(ValidationError) as validation_err:
        VerificationService.verify_phone(**args)

    assert(validation_err.value.messages[0]) == 'Verification code has expired.'
    assert(validation_err.value.field_names[0]) == 'code'


@responses.activate
def test_verify_phone_invalid_code():
    responses.add(
        responses.GET,
        'https://api.authy.com/protected/json/phones/verification/status',
        json={'error_code': '60022'},   # No pending verification
        status=401
    )

    args = {
        'eth_address': str_eth(sample_eth_address),
        'country_calling_code': '1',
        'phone': '12341234',
        'code': 'garbage'
    }
    with pytest.raises(ValidationError) as validation_err:
        VerificationService.verify_phone(**args)

    assert(validation_err.value.messages[0]) == 'Verification code is incorrect.'
    assert(validation_err.value.field_names[0]) == 'code'


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
    assert resp_data['claim_type'] == CLAIM_TYPES['email']
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
    resp = VerificationService.facebook_auth_url()
    resp_data = resp.data
    assert resp_data['url'] == (
        'https://www.facebook.com/v2.12/dialog/oauth?client_id'
        '=facebook-client-id&redirect_uri'
        '=https://testhost.com/redirects/facebook/')


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
    assert isinstance(resp, VerificationServiceResponse)
    resp_data = resp.data
    mock_http_conn.request.assert_called_once_with(
        'GET',
        '/v2.12/oauth/access_token?client_id=facebook-client-id&' +
        'client_secret=facebook-client-secret&redirect_uri=' +
        'https://testhost.com/redirects/facebook/&code=abcde12345')
    assert len(resp_data['signature']) == SIGNATURE_LENGTH
    assert resp_data['claim_type'] == CLAIM_TYPES['facebook']
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
        'code': 'bananas'
    }
    with pytest.raises(FacebookVerificationError) as service_err:
        VerificationService.verify_facebook(**args)

    mock_http_conn.request.assert_called_once_with(
        'GET',
        '/v2.12/oauth/access_token?client_id=facebook-client-id' +
        '&client_secret=facebook-client-secret&' +
        'redirect_uri=https://testhost.com/redirects/facebook/&code=bananas')
    assert str(service_err.value) == 'The code you provided is invalid.'


@mock.patch('logic.attestation_service.requests')
@mock.patch('logic.attestation_service.session')
def test_twitter_auth_url(mock_session, mock_requests):
    response_content = b'oauth_token=peaches&oauth_token_secret=pears'
    mock_requests.post().content = response_content
    mock_requests.post().status_code = 200
    resp = VerificationService.twitter_auth_url()
    resp_data = resp.data
    assert isinstance(resp, VerificationServiceResponse)
    assert resp_data['url'] == ('https://api.twitter.com/oauth/authenticate?'
                                'oauth_token=peaches')


@mock.patch('logic.attestation_service.requests')
@mock.patch('logic.attestation_service.session')
def test_verify_twitter_valid_code(mock_session, mock_requests):
    dict = {'request_token': 'bar'}
    mock_session.__contains__.side_effect = dict.__contains__
    mock_requests.post().status_code = 200
    args = {
        'eth_address': '0x112234455C3a32FD11230C42E7Bccd4A84e02010',
        'oauth_verifier': 'blueberries'
    }
    resp = VerificationService.verify_twitter(**args)
    resp_data = resp.data
    assert isinstance(resp, VerificationServiceResponse)
    assert len(resp_data['signature']) == SIGNATURE_LENGTH
    assert resp_data['claim_type'] == CLAIM_TYPES['twitter']
    assert resp_data['data'] == 'twitter verified'


@mock.patch('logic.attestation_service.requests')
@mock.patch('logic.attestation_service.session')
def test_verify_twitter_invalid_verifier(mock_session, mock_requests):
    dict = {'request_token': 'bar'}
    mock_session.__contains__.side_effect = dict.__contains__
    mock_requests.post().status_code = 401
    args = {
        'eth_address': '0x112234455C3a32FD11230C42E7Bccd4A84e02010',
        'oauth_verifier': 'pineapples'
    }
    with pytest.raises(TwitterVerificationError) as service_err:
        VerificationService.verify_twitter(**args)

    assert str(service_err.value) == 'The verifier you provided is invalid.'


@mock.patch('logic.attestation_service.requests')
@mock.patch('logic.attestation_service.session')
def test_verify_twitter_invalid_session(mock_session, mock_requests):
    args = {
        'eth_address': '0x112234455C3a32FD11230C42E7Bccd4A84e02010',
        'oauth_verifier': 'pineapples'
    }

    with pytest.raises(TwitterVerificationError) as service_err:
        VerificationService.verify_twitter(**args)

    assert str(service_err.value) == 'Session not found.'


def test_generate_airbnb_verification_code():
    resp = VerificationService.generate_airbnb_verification_code(
        '0x112234455C3a32FD11230C42E7Bccd4A84e02010',
        '123456'
    )
    assert isinstance(resp, VerificationServiceResponse)

    assert resp.data['code'] == "art brick aspect accident brass betray antenna"


def test_generate_airbnb_verification_code_incorrect_user_id_format():
    with pytest.raises(AirbnbVerificationError) as service_err:
        VerificationService.generate_airbnb_verification_code(
            '0x112234455C3a32FD11230C42E7Bccd4A84e02010',
            '12a34'
        )

    assert str(service_err.value) == 'AirbnbUserId should be a number.'


@mock.patch('logic.attestation_service.urlopen')
def test_verify_airbnb(mock_urllib_request):
    mock_urllib_request.return_value.read.return_value = """
        <html><div>
            Airbnb profile description
            Origin verification code: art brick aspect accident brass betray antenna
            some more profile description
        </div></html>""".encode('utf-8')
    airbnbUserId = "123456"

    resp = VerificationService.verify_airbnb(
        '0x112234455C3a32FD11230C42E7Bccd4A84e02010',
        airbnbUserId
    )
    assert isinstance(resp, VerificationServiceResponse)

    resp_data = resp.data
    assert len(resp_data['signature']) == SIGNATURE_LENGTH
    assert resp_data['claim_type'] == CLAIM_TYPES['airbnb']
    assert resp_data['data'] == 'airbnbUserId:' + airbnbUserId


@mock.patch('logic.attestation_service.urlopen')
def test_verify_airbnb_verification_code_missing(mock_urllib_request):
    mock_urllib_request.return_value.read.return_value = """
        <html><div>
        Airbnb profile description some more profile description
        </div></html>""".encode('utf-8')

    with pytest.raises(AirbnbVerificationError) as service_err:
        VerificationService.verify_airbnb(
            '0x112234455C3a32FD11230C42E7Bccd4A84e02010',
            "123456"
        )

    assert str(service_err.value) == "Origin verification code: art brick aspect " \
        + "accident brass betray antenna has not been found in user's Airbnb profile."


@mock.patch('logic.attestation_service.urlopen')
def test_verify_airbnb_verification_code_incorrect(mock_urllib_request):
    mock_urllib_request.return_value.read.return_value = """
        <html><div>
        Airbnb profile description
        Origin verification code: art brick aspect pimpmobile
        some more profile description
        </div></html>""".encode('utf-8')

    with pytest.raises(AirbnbVerificationError) as service_err:
        VerificationService.verify_airbnb(
            '0x112234455C3a32FD11230C42E7Bccd4A84e02010',
            "123456"
        )

    assert str(service_err.value) == "Origin verification code: art brick aspect " \
        + "accident brass betray antenna has not been found in user's Airbnb profile."


@mock.patch('logic.attestation_service.urlopen')
def test_verify_airbnb_verification_code_incorrect_user_id_format(mock_urllib_request):
    mock_urllib_request.return_value.read.return_value = """
        <html><div>
        Airbnb profile description
        Origin verification code: art brick aspect accident brass betray antenna
        some more profile description
        </div></html>""".encode('utf-8')

    with pytest.raises(AirbnbVerificationError) as service_err:
        VerificationService.verify_airbnb(
            '0x112234455C3a32FD11230C42E7Bccd4A84e02010',
            "12a34"
        )

    assert str(service_err.value) == 'AirbnbUserId should be a number.'


@mock.patch('logic.attestation_service.urlopen', side_effect=HTTPError(
    'https://www.airbnb.com/users/show/99999999999999999',
    404,
    "User not found",
    {},
    {}
))
def test_verify_airbnb_verification_code_non_existing_user(mock_urllib_request):
    with pytest.raises(AirbnbVerificationError) as service_err:
        VerificationService.verify_airbnb(
            '0x112234455C3a32FD11230C42E7Bccd4A84e02010',
            "99999999999999999"
        )

    assert str(service_err.value) == 'Airbnb user id: 99999999999999999 not found.'


@mock.patch('logic.attestation_service.urlopen', side_effect=HTTPError(
    'https://www.airbnb.com/users/show/123',
    500,
    "Internal server error",
    {},
    {}
))
def test_verify_airbnb_verification_code_internal_server_error(mock_urllib_request):
    with pytest.raises(AirbnbVerificationError) as service_err:
        VerificationService.verify_airbnb(
            '0x112234455C3a32FD11230C42E7Bccd4A84e02010',
            "123"
        )

    assert str(service_err.value) == "Can not fetch user's Airbnb profile."
