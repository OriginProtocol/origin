import datetime

from api import verification
from database import db_models
from logic import verification_service
from tests.factories.verification import VerificationCodeFactory
from util.time_ import utcnow
VC = db_models.VerificationCode


def str_eth(numeric_eth_address):
    return '0x{:02X}'.format(int(numeric_eth_address))


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


def test_generate_phone_verification_code_phone_already_in_db(mock_send_sms, session):
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
    assert VC.query.filter(VC.phone==req.phone).count() == 1

    db_code = VC.query.filter(VC.phone==req.phone).first()
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

    print(db_models.VerificationCode.query.filter().first())
    req = verification.VerifyPhoneRequest(
        eth_address=str_eth(vc_obj.eth_address),
        phone=vc_obj.phone,
        code=vc_obj.code)
    resp = service().invoke('verify_phone', req)

    assert 'SUCCESS' == resp.response_code

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
    assert resp.errors[0].message == 'Please wait briefly before requesting a new verification code.' 
