import datetime
import unittest

import mock
from twilio.rest.api.v2010.account.message import MessageList

from api import verification
from database import db_models
from logic import verification_service
from testing import test_base
from testing import test_data
from web3 import Web3

VC = db_models.VerificationCode
VCD = test_data.VerificationCodeData

def str_eth(numeric_eth_address):
    return Web3.toChecksumAddress(hex(numeric_eth_address))

class VerificationServiceTest(test_base.DatabaseWithTestdataTest):
    def service(self):
        return verification_service.VerificationServiceImpl()

    @mock.patch.object(MessageList, 'create')
    def test_generate_phone_verification_code_new_phone(self, mock_create_sms):
        req = verification.GeneratePhoneVerificationCodeRequest(
            eth_address='0x112234455C3A32FD11230C42E7BCCD4A84E02010',
            phone='5551231212')
        resp = self.service().invoke('generate_phone_verification_code', req)
        self.assertEqual(resp.response_code, 'SUCCESS')

        db_code = VC.query.filter(VC.phone == req.phone).first()
        self.assertIsNotNone(db_code)
        self.assertIsNotNone(db_code.code)
        self.assertEqual(6, len(db_code.code))
        self.assertIsNotNone(db_code.expires_at)
        self.assertIsNotNone(db_code.created_at)
        self.assertIsNotNone(db_code.updated_at)

        mock_create_sms.assert_called_once_with(
            body='Your Origin verification code is {}. It will expire in 30 minutes.'.format(db_code.code),
            from_='5551112222',
            to=req.phone)

    @mock.patch.object(MessageList, 'create')
    def test_generate_phone_verification_code_phone_already_in_db(self, mock_create_sms):
        req = verification.GeneratePhoneVerificationCodeRequest(
            eth_address=str_eth(VCD.code1.eth_address),
            phone=VCD.code1.phone)
        resp = self.service().invoke('generate_phone_verification_code', req)
        self.assertEqual(resp.response_code, 'SUCCESS')

        self.assertEqual(VC.query.filter(VC.phone == req.phone).count(), 1)
        db_code = VC.query.filter(VC.phone == req.phone).first()
        self.assertIsNotNone(db_code)
        self.assertIsNotNone(db_code.code)
        self.assertEqual(len(db_code.code), 6)
        self.assertIsNotNone(db_code.expires_at)
        self.assertIsNotNone(db_code.created_at)
        self.assertIsNotNone(db_code.updated_at)
        self.assertGreater(db_code.updated_at, db_code.created_at)
        self.assertGreater(db_code.expires_at, VCD.code1.expires_at)

        mock_create_sms.assert_called_once_with(
            body='Your Origin verification code is {}. It will expire in 30 minutes.'.format(db_code.code),
            from_='5551112222',
            to=req.phone)

    @mock.patch('util.time_.utcnow')
    def test_verify_phone_valid_code(self, mock_now):
        code_data = VCD.code1
        req = verification.VerifyPhoneRequest(
            eth_address=str_eth(code_data.eth_address),
            phone=code_data.phone,
            code=code_data.code)
        mock_now.return_value = code_data.expires_at - datetime.timedelta(minutes=1)
        resp = self.service().invoke('verify_phone', req)
        self.assertEqual(resp.response_code, 'SUCCESS')
        self.assertEqual(resp.signature, '0x7585215a60cde667abd47fb8d4ab5192673706ee3df0fd311d26bff88df36dc40d8ba2351e8c70ad1d1ac0e84817ca3c9774ac0d21ccb5f9e6c4615d2ac9a64b01')
        self.assertEqual(resp.claim_type, 10)
        self.assertEqual(resp.data, 'phone verified')

        db_identity = db_models.Identity.query.get(code_data.eth_address)
        self.assertIsNotNone(db_identity)
        self.assertTrue(db_identity.verified)

    @mock.patch('util.time_.utcnow')
    def test_verify_phone_expired_code(self, mock_now):
        code_data = VCD.code1
        req = verification.VerifyPhoneRequest(
            eth_address=str_eth(code_data.eth_address),
            phone=code_data.phone,
            code=code_data.code)
        mock_now.return_value = code_data.expires_at + datetime.timedelta(minutes=1)
        resp = self.service().invoke('verify_phone', req)
        self.assertEqual(resp.response_code, 'REQUEST_ERROR')
        self.assertEqual(len(resp.errors), 1)
        self.assertEqual(resp.errors[0].code, 'EXPIRED')
        self.assertEqual(resp.errors[0].path, 'code')

        db_identity = db_models.Identity.query.get(code_data.eth_address)
        self.assertIsNone(db_identity)

    @mock.patch('util.time_.utcnow')
    def test_verify_phone_wrong_code(self, mock_now):
        code_data = VCD.code1
        req = verification.VerifyPhoneRequest(
            eth_address=str_eth(code_data.eth_address),
            phone=code_data.phone,
            code='garbage')
        mock_now.return_value = code_data.expires_at - datetime.timedelta(minutes=1)
        resp = self.service().invoke('verify_phone', req)
        self.assertEqual(resp.response_code, 'REQUEST_ERROR')
        self.assertEqual(len(resp.errors), 1)
        self.assertEqual(resp.errors[0].code, 'INVALID')
        self.assertEqual(resp.errors[0].path, 'code')

        db_identity = db_models.Identity.query.get(code_data.eth_address)
        self.assertIsNone(db_identity)

    @mock.patch('util.time_.utcnow')
    def test_verify_phone_phone_not_found(self, mock_now):
        code_data = VCD.code1
        req = verification.VerifyPhoneRequest(
            eth_address=str_eth(code_data.eth_address),
            phone='garbage',
            code=code_data.code)
        mock_now.return_value = code_data.expires_at - datetime.timedelta(minutes=1)
        resp = self.service().invoke('verify_phone', req)
        self.assertEqual(resp.response_code, 'REQUEST_ERROR')
        self.assertEqual(len(resp.errors), 1)
        self.assertEqual(resp.errors[0].code, 'NOT_FOUND')
        self.assertEqual(resp.errors[0].path, 'phone')

        db_identity = db_models.Identity.query.get(code_data.eth_address)
        self.assertIsNone(db_identity)

    @mock.patch('util.time_.utcnow')
    def test_generate_phone_verification_rate_limit_exceeded(self, mock_now):
        req = verification.GeneratePhoneVerificationCodeRequest(
            eth_address=str_eth(VCD.code1.eth_address),
            phone=VCD.code1.phone)
        mock_now.return_value = VCD.code1.updated_at + datetime.timedelta(seconds=9)
        resp = self.service().invoke('generate_phone_verification_code', req)
        self.assertEqual(resp.response_code, 'REQUEST_ERROR')
        self.assertEqual(len(resp.errors), 1)
        self.assertEqual(resp.errors[0].code, 'RATE_LIMIT_EXCEEDED')
        self.assertIsNone(resp.errors[0].path)
        self.assertEqual(resp.errors[0].message, 'Please wait briefly before requesting a new verification code.')

    @mock.patch('python_http_client.client.Client')
    def test_generate_email_verification_code_new_phone(self, MockHttpClient):
        req = verification.GenerateEmailVerificationCodeRequest(
            eth_address='0x112234455C3A32FD11230C42E7BCCD4A84E02010',
            email='hello@world.foo')
        resp = self.service().invoke('generate_email_verification_code', req)
        self.assertEqual(resp.response_code, 'SUCCESS')

        db_code = VC.query.filter(VC.email == req.email).first()
        self.assertIsNotNone(db_code)
        self.assertIsNotNone(db_code.code)
        self.assertEqual(6, len(db_code.code))
        self.assertIsNotNone(db_code.expires_at)
        self.assertIsNotNone(db_code.created_at)
        self.assertIsNotNone(db_code.updated_at)

    @mock.patch('python_http_client.client.Client')
    def test_generate_email_verification_code_email_already_in_db(self, MockHttpClient):
        req = verification.GenerateEmailVerificationCodeRequest(
            eth_address=str_eth(VCD.code1.eth_address),
            email=VCD.code1.email)
        resp = self.service().invoke('generate_email_verification_code', req)
        self.assertEqual(resp.response_code, 'SUCCESS')

        self.assertEqual(VC.query.filter(VC.email == req.email).count(), 1)
        db_code = VC.query.filter(VC.email == req.email).first()
        self.assertIsNotNone(db_code)
        self.assertIsNotNone(db_code.code)
        self.assertEqual(len(db_code.code), 6)
        self.assertIsNotNone(db_code.expires_at)
        self.assertIsNotNone(db_code.created_at)
        self.assertIsNotNone(db_code.updated_at)
        self.assertGreater(db_code.updated_at, db_code.created_at)
        self.assertGreater(db_code.expires_at, VCD.code1.expires_at)

    @mock.patch('util.time_.utcnow')
    def test_verify_email_valid_code(self, mock_now):
        code_data = VCD.code1
        req = verification.VerifyEmailRequest(
            eth_address=str_eth(code_data.eth_address),
            email=code_data.email,
            code=code_data.code)
        mock_now.return_value = code_data.expires_at - datetime.timedelta(minutes=1)
        resp = self.service().invoke('verify_email', req)
        self.assertEqual(resp.response_code, 'SUCCESS')
        self.assertEqual(resp.signature, '0xb48b4acc7074385d704d47c8dfd34ac58ff519fe1cf5c962d00d250d290043b55248239f269b10dd3b50f9d39b6ca72409910623b0819929b0a5f3399992e34301')
        self.assertEqual(resp.claim_type, 11)
        self.assertEqual(resp.data, 'email verified')

    @mock.patch('util.time_.utcnow')
    def test_verify_email_expired_code(self, mock_now):
        code_data = VCD.code1
        req = verification.VerifyEmailRequest(
            eth_address=str_eth(code_data.eth_address),
            email=code_data.email,
            code=code_data.code)
        mock_now.return_value = code_data.expires_at + datetime.timedelta(minutes=1)
        resp = self.service().invoke('verify_email', req)
        self.assertEqual(resp.response_code, 'REQUEST_ERROR')
        self.assertEqual(len(resp.errors), 1)
        self.assertEqual(resp.errors[0].code, 'EXPIRED')
        self.assertEqual(resp.errors[0].path, 'code')

    @mock.patch('util.time_.utcnow')
    def test_verify_email_wrong_code(self, mock_now):
        code_data = VCD.code1
        req = verification.VerifyEmailRequest(
            eth_address=str_eth(code_data.eth_address),
            email=code_data.email,
            code='garbage')
        mock_now.return_value = code_data.expires_at - datetime.timedelta(minutes=1)
        resp = self.service().invoke('verify_email', req)
        self.assertEqual(resp.response_code, 'REQUEST_ERROR')
        self.assertEqual(len(resp.errors), 1)
        self.assertEqual(resp.errors[0].code, 'INVALID')
        self.assertEqual(resp.errors[0].path, 'code')

    @mock.patch('util.time_.utcnow')
    def test_verify_email_email_not_found(self, mock_now):
        code_data = VCD.code1
        req = verification.VerifyEmailRequest(
            eth_address=str_eth(code_data.eth_address),
            email='garbage',
            code=code_data.code)
        mock_now.return_value = code_data.expires_at - datetime.timedelta(minutes=1)
        resp = self.service().invoke('verify_email', req)
        self.assertEqual(resp.response_code, 'REQUEST_ERROR')
        self.assertEqual(len(resp.errors), 1)
        self.assertEqual(resp.errors[0].code, 'NOT_FOUND')
        self.assertEqual(resp.errors[0].path, 'email')

    def test_facebook_auth_url(self):
        req = verification.FacebookAuthUrlRequest(redirect_url='http://hello.world')
        resp = self.service().invoke('facebook_auth_url', req)
        self.assertEqual(resp.response_code, 'SUCCESS')
        self.assertEqual(resp.url, 'https://www.facebook.com/v2.12/dialog/oauth?client_id=facebook-client-id&redirect_uri=http://hello.world/')

    @mock.patch('http.client.HTTPSConnection')
    def test_verify_facebook_valid_code(self, MockHttpConnection):
        mock_http_conn = mock.Mock()
        mock_get_response = mock.Mock()
        mock_get_response.read.return_value = '{"access_token": "foo"}'
        mock_http_conn.getresponse.return_value = mock_get_response
        MockHttpConnection.return_value = mock_http_conn
        req = verification.VerifyFacebookRequest(
            eth_address='0x112234455C3a32FD11230C42E7Bccd4A84e02010',
            redirect_url='http://hello.world',
            code='abcde12345')
        resp = self.service().invoke('verify_facebook', req)
        mock_http_conn.request.assert_called_once_with(
            'GET',
            '/v2.12/oauth/access_token?client_id=facebook-client-id&client_secret=facebook-client-secret&redirect_uri=http://hello.world/&code=abcde12345'
        )
        self.assertEqual(resp.response_code, 'SUCCESS')
        self.assertEqual(resp.signature, '0x6b9914cebe4e05a4e6c83525d653e0f318b33c55b4691f9a16211a63eb7a0ee7458ad753068bb7bbcaf3f3aa7ee339ec110ed07feb29278c029cfd32e816ea5500')
        self.assertEqual(resp.claim_type, 3)
        self.assertEqual(resp.data, 'facebook verified')

    @mock.patch('http.client.HTTPSConnection')
    def test_verify_facebook_invalid_code(self, MockHttpConnection):
        mock_http_conn = mock.Mock()
        mock_get_response = mock.Mock()
        mock_get_response.read.return_value = '{"error": "bar"}'
        mock_http_conn.getresponse.return_value = mock_get_response
        MockHttpConnection.return_value = mock_http_conn
        req = verification.VerifyFacebookRequest(
            eth_address='0x112234455C3a32FD11230C42E7Bccd4A84e02010',
            redirect_url='http://hello.world',
            code='bananas')
        resp = self.service().invoke('verify_facebook', req)
        mock_http_conn.request.assert_called_once_with(
            'GET',
            '/v2.12/oauth/access_token?client_id=facebook-client-id&client_secret=facebook-client-secret&redirect_uri=http://hello.world/&code=bananas'
        )
        self.assertEqual(resp.response_code, 'REQUEST_ERROR')
        self.assertEqual(len(resp.errors), 1)
        self.assertEqual(resp.errors[0].code, 'INVALID')
        self.assertEqual(resp.errors[0].path, 'code')

    @mock.patch('oauth2.Client')
    @mock.patch('logic.verification_service.session')
    def test_twitter_auth_url(self, mock_session, MockOauthClient):
        mock_oauth_client = mock.Mock()
        mock_oauth_client.request.return_value = {'status': '200'}, b'oauth_token=peaches&oauth_token_secret=pears'
        MockOauthClient.return_value = mock_oauth_client
        req = verification.TwitterAuthUrlRequest()
        resp = self.service().invoke('twitter_auth_url', req)
        mock_oauth_client.request.assert_called_once_with('https://api.twitter.com/oauth/request_token', 'GET')
        self.assertEqual(resp.response_code, 'SUCCESS')
        self.assertEqual(resp.url, 'https://api.twitter.com/oauth/authenticate?oauth_token=peaches')

    @mock.patch('oauth2.Client')
    @mock.patch('logic.verification_service.session')
    def test_verify_twitter_valid_code(self, mock_session, MockOauthClient):
        mock_oauth_client = mock.Mock()
        mock_oauth_client.request.return_value = {'status': '200'}, b'oauth_token=guavas&oauth_token_secret=mangos'
        MockOauthClient.return_value = mock_oauth_client
        req = verification.VerifyTwitterRequest(
            eth_address='0x112234455C3a32FD11230C42E7Bccd4A84e02010',
            oauth_verifier='blueberries')
        resp = self.service().invoke('verify_twitter', req)
        mock_oauth_client.request.assert_called_once_with('https://api.twitter.com/oauth/access_token', 'GET')
        self.assertEqual(resp.response_code, 'SUCCESS')
        self.assertEqual(resp.signature, '0x05b4c162b9e27671430f2a13692bd0c335a580c0ab1494eb777199b9bfb87d4c333935d48319cdff53f130459cd03614f5871c0f36095cbe0245046bee57156200')
        self.assertEqual(resp.claim_type, 4)
        self.assertEqual(resp.data, 'twitter verified')

    @mock.patch('oauth2.Client')
    @mock.patch('logic.verification_service.session')
    def test_verify_twitter_invalid_verifier(self, mock_session, MockOauthClient):
        mock_oauth_client = mock.Mock()
        mock_oauth_client.request.return_value = {'status': '401'}, b''
        MockOauthClient.return_value = mock_oauth_client
        req = verification.VerifyTwitterRequest(
            eth_address='0x112234455C3a32FD11230C42E7Bccd4A84e02010',
            oauth_verifier='pineapples')
        resp = self.service().invoke('verify_twitter', req)
        mock_oauth_client.request.assert_called_once_with('https://api.twitter.com/oauth/access_token', 'GET')
        self.assertEqual(resp.response_code, 'REQUEST_ERROR')
        self.assertEqual(len(resp.errors), 1)
        self.assertEqual(resp.errors[0].code, 'INVALID')
        self.assertEqual(resp.errors[0].path, 'oauth_verifier')

if __name__ == '__main__':
    unittest.main()
