import datetime
import secrets

import apilib
from twilio.rest import Client

from api import verification
from config import settings
from database import db
from database import db_models
from logic import service_utils
from util import time_, attestations
from web3 import Web3, HTTPProvider

web3 = Web3(HTTPProvider('http://localhost:9545')) # TODO: use env vars to connect to live networks
signing_account = web3.eth.accounts[1] # TODO: allow this to be specified from env var in production

VC = db_models.VerificationCode

CODE_EXPIRATION_TIME_MINUTES = 30


class VerificationServiceImpl(
        verification.VerificationService,
        apilib.ServiceImplementation):

    def generate_phone_verification_code(self, req):
        addr = numeric_eth(req.eth_address)
        db_code = VC.query \
            .filter(VC.eth_address == addr) \
            .first()
        if db_code is None:
            db_code = db_models.VerificationCode(eth_address=addr)
            db.session.add(db_code)
        elif (time_.utcnow() - db_code.updated_at).total_seconds() < 10:
            # If the client has requested a verification code already within
            # the last 10 seconds,
            # throw a rate limit error, so they can't just keep creating codes
            # and guessing them
            # rapidly.
            raise service_utils.req_error(
                code='RATE_LIMIT_EXCEEDED',
                message=('Please wait briefly before requesting a new '
                         'verification code.'))
        db_code.phone = req.phone
        db_code.code = random_numeric_token()
        db_code.expires_at = time_.utcnow(
        ) + datetime.timedelta(minutes=CODE_EXPIRATION_TIME_MINUTES)
        db.session.commit()
        send_code_via_sms(req.phone, db_code.code)
        return verification.GeneratePhoneVerificationCodeResponse()

    def verify_phone(self, req):
        addr = numeric_eth(req.eth_address)
        db_code = VC.query \
            .filter(VC.eth_address == addr) \
            .filter(VC.phone == req.phone) \
            .first()
        if db_code is None:
            raise service_utils.req_error(
                code='NOT_FOUND',
                path='phone',
                message='The given phone number was not found.')
        if req.code != db_code.code:
            raise service_utils.req_error(
                code='INVALID',
                path='code',
                message='The code you provided is invalid.')
        if time_.utcnow() > db_code.expires_at:
            raise service_utils.req_error(
                code='EXPIRED',
                path='code',
                message='The code you provided has expired.')
        db_identity = db_models.Identity(
            eth_address=addr,
            phone=req.phone,
            verified=True)
        db.session.add(db_identity)
        db.session.commit()
        data = 'phone verified' # TODO: determine what the text should be
        claim_type = 10 # TODO: determine claim type integer code for phone verification
        signature = attestations.generate_signature(web3, signing_account, req.eth_address, claim_type, data)
        return verification.VerifyPhoneResponse(signature=signature, claim_type=claim_type, data=data)

def numeric_eth(str_eth_address):
    return int(str_eth_address, 16)


# Generates a six-digit numeric token.
def random_numeric_token():
    # Don't use tokens that are close to 0 that will look stupid to users.
    rand = secrets.randbelow(1000000 - 1000)
    return '{0:06d}'.format(rand + 1000)


def send_code_via_sms(phone, code):
    client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
    client.messages.create(
        to=phone,
        from_=settings.TWILIO_NUMBER,
        body=('Your Origin verification code is {}.'
              ' It will expire in 30 minutes.').format(code))
