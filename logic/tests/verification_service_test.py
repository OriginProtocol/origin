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
        self.assertEqual('SUCCESS', resp.response_code)

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
        self.assertEqual('SUCCESS', resp.response_code)

        self.assertEqual(1, VC.query.filter(VC.phone == req.phone).count())
        db_code = VC.query.filter(VC.phone == req.phone).first()
        self.assertIsNotNone(db_code)
        self.assertIsNotNone(db_code.code)
        self.assertEqual(6, len(db_code.code))
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
        self.assertEqual('SUCCESS', resp.response_code)

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
        self.assertEqual('REQUEST_ERROR', resp.response_code)
        self.assertEqual(1, len(resp.errors))
        self.assertEqual('EXPIRED', resp.errors[0].code)
        self.assertEqual('code', resp.errors[0].path)

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
        self.assertEqual('REQUEST_ERROR', resp.response_code)
        self.assertEqual(1, len(resp.errors))
        self.assertEqual('INVALID', resp.errors[0].code)
        self.assertEqual('code', resp.errors[0].path)

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
        self.assertEqual('REQUEST_ERROR', resp.response_code)
        self.assertEqual(1, len(resp.errors))
        self.assertEqual('NOT_FOUND', resp.errors[0].code)
        self.assertEqual('phone', resp.errors[0].path)

        db_identity = db_models.Identity.query.get(code_data.eth_address)
        self.assertIsNone(db_identity)

    @mock.patch('util.time_.utcnow')
    def test_generate_phone_verification_rate_limit_exceeded(self, mock_now):
        req = verification.GeneratePhoneVerificationCodeRequest(
            eth_address=str_eth(VCD.code1.eth_address),
            phone=VCD.code1.phone)
        mock_now.return_value = VCD.code1.updated_at + datetime.timedelta(seconds=9)
        resp = self.service().invoke('generate_phone_verification_code', req)
        self.assertEqual('REQUEST_ERROR', resp.response_code)
        self.assertEqual(1, len(resp.errors))
        self.assertEqual('RATE_LIMIT_EXCEEDED', resp.errors[0].code)
        self.assertIsNone(resp.errors[0].path)
        self.assertEqual('Please wait briefly before requesting a new verification code.', resp.errors[0].message)

if __name__ == '__main__':
    unittest.main()
