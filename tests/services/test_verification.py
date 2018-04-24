import datetime
import mock

from api import verification
from database import db_models
from logic import verification_service
from web3 import Web3
from tests.factories.verification import VerificationCodeFactory
from util.time_ import utcnow
VC = db_models.VerificationCode


def str_eth(numeric_eth_address):
    return Web3.toChecksumAddress(hex(int(numeric_eth_address)))


def service():
    return verification_service.VerificationServiceImpl()


def test_generate_phone_verification_code_new_phone(mock_send_sms):
    req = verification.GeneratePhoneVerificationCodeRequest(
        eth_address='0x112234455C3A32FD11230C42E7BCCD4A84E02010',
        phone='5551231212')
    resp = service().invoke('generate_phone_verification_code', req)
    assert 'SUCCESS' == resp.response_code

    db_code = VC.query.filter(VC.phone == req.phone).first()
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

    req = verification.GeneratePhoneVerificationCodeRequest(
        eth_address=str_eth(vc_obj.eth_address),
        phone=vc_obj.phone)
    resp = service().invoke('generate_phone_verification_code', req)

    assert 'SUCCESS' == resp.response_code
    assert VC.query.filter(VC.phone == req.phone).count() == 1

    db_code = VC.query.filter(VC.phone == req.phone).first()
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

    req = verification.VerifyPhoneRequest(
        eth_address=str_eth(vc_obj.eth_address),
        phone=vc_obj.phone,
        code=vc_obj.code)
    resp = service().invoke('verify_phone', req)

    assert resp.response_code == 'SUCCESS'
    assert resp.signature == ('0x1aa9ad132f99cee742206f66663cd92cb769de97ffad'
                              'fff61d37306b23866f385882a122633df05fe478e3e3'
                              '908196892a18c1666a31f19be7bcb83d8b321b661c')
    assert resp.claim_type == 10
    assert resp.data == 'phone verified'

    db_identity = db_models.Identity.query.get(vc_obj.eth_address)
    assert db_identity is not None
    assert db_identity.verified


def test_verify_phone_expired_code(session):
    vc_obj = VerificationCodeFactory.build()
    vc_obj.expires_at = utcnow() - datetime.timedelta(days=1)
    session.add(vc_obj)
    session.commit()

    req = verification.VerifyPhoneRequest(
        eth_address=str_eth(vc_obj.eth_address),
        phone=vc_obj.phone,
        code=vc_obj.code)
    resp = service().invoke('verify_phone', req)

    assert resp.response_code == 'REQUEST_ERROR'
    assert len(resp.errors) == 1
    assert resp.errors[0].code == 'EXPIRED'
    assert resp.errors[0].path == 'code'

    db_identity = db_models.Identity.query.get(vc_obj.eth_address)
    assert db_identity is None


def test_verify_phone_wrong_code(session):
    vc_obj = VerificationCodeFactory.build()
    session.add(vc_obj)
    session.commit()

    req = verification.VerifyPhoneRequest(
        eth_address=str_eth(vc_obj.eth_address),
        phone=vc_obj.phone,
        code='garbage')

    resp = service().invoke('verify_phone', req)

    assert resp.response_code == 'REQUEST_ERROR'
    assert len(resp.errors) == 1
    assert resp.errors[0].code == 'INVALID'
    assert resp.errors[0].path == 'code'

    db_identity = db_models.Identity.query.get(vc_obj.eth_address)
    assert db_identity is None


def test_verify_phone_phone_not_found(session):
    vc_obj = VerificationCodeFactory.build()
    session.add(vc_obj)
    session.commit()

    req = verification.VerifyPhoneRequest(
        eth_address=str_eth(vc_obj.eth_address),
        phone='garbage',
        code=vc_obj.code)

    resp = service().invoke('verify_phone', req)

    assert resp.response_code == 'REQUEST_ERROR'
    assert len(resp.errors) == 1
    assert resp.errors[0].code == 'NOT_FOUND'
    assert resp.errors[0].path == 'phone'

    db_identity = db_models.Identity.query.get(vc_obj.eth_address)
    assert db_identity is None


def test_generate_phone_verification_rate_limit_exceeded(session):
    vc_obj = VerificationCodeFactory.build()
    vc_obj.updated_at = utcnow() + datetime.timedelta(seconds=9)
    session.add(vc_obj)
    session.commit()

    req = verification.GeneratePhoneVerificationCodeRequest(
        eth_address=str_eth(vc_obj.eth_address),
        phone=vc_obj.phone)

    resp = service().invoke('generate_phone_verification_code', req)

    assert resp.response_code == 'REQUEST_ERROR'
    assert len(resp.errors) == 1
    assert resp.errors[0].code == 'RATE_LIMIT_EXCEEDED'
    assert resp.errors[0].path is None
    assert resp.errors[0].message == ('Please wait briefly before requesting a'
                                      ' new verification code.')


@mock.patch('python_http_client.client.Client')
def test_generate_email_verification_code_new_phone(MockHttpClient):
    req = verification.GenerateEmailVerificationCodeRequest(
        eth_address='0x112234455C3A32FD11230C42E7BCCD4A84E02010',
        email='hello@world.foo')
    resp = service().invoke('generate_email_verification_code', req)
    assert resp.response_code == 'SUCCESS'

    db_code = VC.query.filter(VC.email == req.email).first()
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

    req = verification.GenerateEmailVerificationCodeRequest(
        eth_address=str_eth(vc_obj.eth_address),
        email=vc_obj.email)
    resp = service().invoke('generate_email_verification_code', req)

    assert resp.response_code == 'SUCCESS'
    assert VC.query.filter(VC.email == req.email).count() == 1
    db_code = VC.query.filter(VC.email == req.email).first()
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

    req = verification.VerifyEmailRequest(
        eth_address=str_eth(vc_obj.eth_address),
        email=vc_obj.email,
        code=vc_obj.code)
    mock_now.return_value = vc_obj.expires_at - datetime.timedelta(minutes=1)
    resp = service().invoke('verify_email', req)
    assert resp.response_code == 'SUCCESS'
    assert resp.signature == ('0x02fb9b226d84e0124ad16915324359432ecc4091273c8'
                              'f3e275c4545c3d79b1e0afc0560eab381649c9bc19407f'
                              '9e344b9a20370e8b32564c5ce6b6ebdaee4061c')
    assert resp.claim_type == 11
    assert resp.data == 'email verified'


@mock.patch('util.time_.utcnow')
def test_verify_email_expired_code(mock_now, session):
    vc_obj = VerificationCodeFactory.build()
    session.add(vc_obj)
    session.commit()

    req = verification.VerifyEmailRequest(
        eth_address=str_eth(vc_obj.eth_address),
        email=vc_obj.email,
        code=vc_obj.code)
    mock_now.return_value = vc_obj.expires_at + datetime.timedelta(minutes=1)
    resp = service().invoke('verify_email', req)
    assert resp.response_code == 'REQUEST_ERROR'
    assert len(resp.errors) == 1
    assert resp.errors[0].code == 'EXPIRED'
    assert resp.errors[0].path == 'code'


@mock.patch('util.time_.utcnow')
def test_verify_email_wrong_code(mock_now, session):
    vc_obj = VerificationCodeFactory.build()
    session.add(vc_obj)
    session.commit()

    req = verification.VerifyEmailRequest(
        eth_address=str_eth(vc_obj.eth_address),
        email=vc_obj.email,
        code='garbage')
    mock_now.return_value = vc_obj.expires_at - datetime.timedelta(minutes=1)
    resp = service().invoke('verify_email', req)
    assert resp.response_code == 'REQUEST_ERROR'
    assert len(resp.errors) == 1
    assert resp.errors[0].code == 'INVALID'
    assert resp.errors[0].path == 'code'


@mock.patch('util.time_.utcnow')
def test_verify_email_email_not_found(mock_now, session):
    vc_obj = VerificationCodeFactory.build()
    session.add(vc_obj)
    session.commit()

    req = verification.VerifyEmailRequest(
        eth_address=str_eth(vc_obj.eth_address),
        email='garbage',
        code=vc_obj.code)
    mock_now.return_value = vc_obj.expires_at - datetime.timedelta(minutes=1)
    resp = service().invoke('verify_email', req)
    assert resp.response_code == 'REQUEST_ERROR'
    assert len(resp.errors) == 1
    assert resp.errors[0].code == 'NOT_FOUND'
    assert resp.errors[0].path == 'email'


def test_facebook_auth_url():
    req = verification.FacebookAuthUrlRequest(
        redirect_url='http://hello.world')
    resp = service().invoke('facebook_auth_url', req)
    assert resp.response_code == 'SUCCESS'
    assert resp.url == ('https://www.facebook.com/v2.12/dialog/oauth?client_id'
                        '=facebook-client-id&redirect_uri=http://hello.world/')


@mock.patch('http.client.HTTPSConnection')
def test_verify_facebook_valid_code(MockHttpConnection):
    mock_http_conn = mock.Mock()
    mock_get_response = mock.Mock()
    mock_get_response.read.return_value = '{"access_token": "foo"}'
    mock_http_conn.getresponse.return_value = mock_get_response
    MockHttpConnection.return_value = mock_http_conn
    req = verification.VerifyFacebookRequest(
        eth_address='0x112234455C3a32FD11230C42E7Bccd4A84e02010',
        redirect_url='http://hello.world',
        code='abcde12345')
    resp = service().invoke('verify_facebook', req)
    mock_http_conn.request.assert_called_once_with(
        'GET',
        '/v2.12/oauth/access_token?client_id=facebook-client-id&' +
        'client_secret=facebook-client-secret&' +
        'redirect_uri=http://hello.world/&code=abcde12345')
    assert resp.response_code == 'SUCCESS'
    assert resp.signature == ('0x77e08f08e7ba15535cf60617660865e3b8e4a2d98aff'
                              'b3f6b2ffe853d005033e000da2e51a3bd401f388ba57e7b'
                              '9f6c5af9415ef341a3145d314d7438a526b831b')
    assert resp.claim_type == 3
    assert resp.data == 'facebook verified'


@mock.patch('http.client.HTTPSConnection')
def test_verify_facebook_invalid_code(MockHttpConnection):
    mock_http_conn = mock.Mock()
    mock_get_response = mock.Mock()
    mock_get_response.read.return_value = '{"error": "bar"}'
    mock_http_conn.getresponse.return_value = mock_get_response
    MockHttpConnection.return_value = mock_http_conn
    req = verification.VerifyFacebookRequest(
        eth_address='0x112234455C3a32FD11230C42E7Bccd4A84e02010',
        redirect_url='http://hello.world',
        code='bananas')
    resp = service().invoke('verify_facebook', req)
    mock_http_conn.request.assert_called_once_with(
        'GET',
        '/v2.12/oauth/access_token?client_id=facebook-client-id' +
        '&client_secret=facebook-client-secret&' +
        'redirect_uri=http://hello.world/&code=bananas')
    assert resp.response_code == 'REQUEST_ERROR'
    assert len(resp.errors) == 1
    assert resp.errors[0].code == 'INVALID'
    assert resp.errors[0].path == 'code'


@mock.patch('oauth2.Client')
@mock.patch('logic.verification_service.session')
def test_twitter_auth_url(mock_session, MockOauthClient):
    mock_oauth_client = mock.Mock()
    mock_oauth_client.request.return_value = {
        'status': '200'}, b'oauth_token=peaches&oauth_token_secret=pears'
    MockOauthClient.return_value = mock_oauth_client
    req = verification.TwitterAuthUrlRequest()
    resp = service().invoke('twitter_auth_url', req)
    mock_oauth_client.request.assert_called_once_with(
        'https://api.twitter.com/oauth/request_token', 'GET')
    assert resp.response_code == 'SUCCESS'
    assert resp.url == ('https://api.twitter.com/oauth/authenticate?'
                        'oauth_token=peaches')


@mock.patch('oauth2.Client')
@mock.patch('logic.verification_service.session')
def test_verify_twitter_valid_code(mock_session, MockOauthClient):
    mock_oauth_client = mock.Mock()
    mock_oauth_client.request.return_value = {
        'status': '200'}, b'oauth_token=guavas&oauth_token_secret=mangos'
    MockOauthClient.return_value = mock_oauth_client
    req = verification.VerifyTwitterRequest(
        eth_address='0x112234455C3a32FD11230C42E7Bccd4A84e02010',
        oauth_verifier='blueberries')
    resp = service().invoke('verify_twitter', req)
    mock_oauth_client.request.assert_called_once_with(
        'https://api.twitter.com/oauth/access_token', 'GET')
    assert resp.response_code == 'SUCCESS'
    assert resp.signature == ('0xeae23a894a3b41ee4b824deea5c121174a7d9a951a6e'
                              'ef6d958d0c68648d65ef11a0eb99d653932927d5565a517'
                              '91df58e5c82dd7777c4e796c3a7bc1104d95c1c')
    assert resp.claim_type == 4
    assert resp.data == 'twitter verified'


@mock.patch('oauth2.Client')
@mock.patch('logic.verification_service.session')
def test_verify_twitter_invalid_verifier(mock_session, MockOauthClient):
    mock_oauth_client = mock.Mock()
    mock_oauth_client.request.return_value = {'status': '401'}, b''
    MockOauthClient.return_value = mock_oauth_client
    req = verification.VerifyTwitterRequest(
        eth_address='0x112234455C3a32FD11230C42E7Bccd4A84e02010',
        oauth_verifier='pineapples')
    resp = service().invoke('verify_twitter', req)
    mock_oauth_client.request.assert_called_once_with(
        'https://api.twitter.com/oauth/access_token', 'GET')
    assert resp.response_code == 'REQUEST_ERROR'
    assert len(resp.errors) == 1
    assert resp.errors[0].code == 'INVALID'
    assert resp.errors[0].path == 'oauth_verifier'
