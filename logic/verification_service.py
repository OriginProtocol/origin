import cgi
import datetime
import http.client
import json
import oauth2 as oauth
import secrets
import sendgrid

import apilib
from sendgrid.helpers.mail import Email, Content, Mail
from twilio.rest import Client

from api import verification
from config import settings
from database import db
from database import db_models
from flask import session
from logic import service_utils
from util import time_, attestations
from web3 import Web3, HTTPProvider

web3 = Web3(HTTPProvider('http://localhost:9545')) # TODO: use env vars to connect to live networks
signing_account = web3.eth.accounts[1] # TODO: allow this to be specified from env var in production

VC = db_models.VerificationCode

sg = sendgrid.SendGridAPIClient(apikey=settings.SENDGRID_API_KEY)

oauth_consumer = oauth.Consumer(settings.TWITTER_CONSUMER_KEY, settings.TWITTER_CONSUMER_SECRET)

twitter_request_token_url = 'https://api.twitter.com/oauth/request_token'
twitter_authenticate_url = 'https://api.twitter.com/oauth/authenticate'
twitter_access_token_url = 'https://api.twitter.com/oauth/access_token'

CODE_EXPIRATION_TIME_MINUTES = 30


class VerificationServiceImpl(
        verification.VerificationService,
        apilib.ServiceImplementation):

    def generate_phone_verification_code(self, req):
        addr = numeric_eth(req.eth_address)
        db_code = VC.query \
            .filter(VC.eth_address == addr) \
            .filter(VC.phone == req.phone) \
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

    def generate_email_verification_code(self, req):
        addr = numeric_eth(req.eth_address)
        db_code = VC.query \
            .filter(VC.eth_address == addr) \
            .filter(VC.email == req.email) \
            .first()
        if db_code is None:
            db_code = db_models.VerificationCode(eth_address=addr)
            db.session.add(db_code)
        elif (time_.utcnow() - db_code.updated_at).total_seconds() < 10:
            # If the client has requested a verification code already within the last 10 seconds,
            # throw a rate limit error, so they can't just keep creating codes and guessing them
            # rapidly.
            raise service_utils.req_error(code='RATE_LIMIT_EXCEEDED', message='Please wait briefly before requesting a new verification code.')
        db_code.email = req.email
        db_code.code = random_numeric_token()
        db_code.expires_at = time_.utcnow() + datetime.timedelta(minutes=CODE_EXPIRATION_TIME_MINUTES)
        db.session.commit()
        send_code_via_email(req.email, db_code.code)
        return verification.GenerateEmailVerificationCodeResponse()

    def verify_email(self, req):
        addr = numeric_eth(req.eth_address)
        db_code = VC.query \
            .filter(VC.eth_address == addr) \
            .filter(VC.email == req.email) \
            .first()
        if db_code is None:
            raise service_utils.req_error(code='NOT_FOUND', path='email', message='The given email was not found.')
        if req.code != db_code.code:
            raise service_utils.req_error(code='INVALID', path='code', message='The code you provided is invalid.')
        if time_.utcnow() > db_code.expires_at:
            raise service_utils.req_error(code='EXPIRED', path='code', message='The code you provided has expired.')

        # Don't save identity to the db for now for simplicity - we can adjust this as needed

        data = 'email verified' # TODO: determine what the text should be
        claim_type = 11 # TODO: determine claim type integer code for email verification
        signature = attestations.generate_signature(web3, signing_account, req.eth_address, claim_type, data)
        return verification.VerifyEmailResponse(signature=signature, claim_type=claim_type, data=data)

    def facebook_auth_url(self, req):
        client_id = settings.FACEBOOK_CLIENT_ID
        redirect_uri = append_trailing_slash(req.redirect_url)
        url = 'https://www.facebook.com/v2.12/dialog/oauth?client_id={}&redirect_uri={}'.format(client_id, redirect_uri)
        return verification.FacebookAuthUrlResponse(url=url)

    def verify_facebook(self, req):
        base_url = 'graph.facebook.com'
        client_id = settings.FACEBOOK_CLIENT_ID
        client_secret = settings.FACEBOOK_CLIENT_SECRET
        redirect_uri = append_trailing_slash(req.redirect_url)
        code = req.code
        path = '/v2.12/oauth/access_token?client_id={}&client_secret={}&redirect_uri={}&code={}'.format(client_id, client_secret, redirect_uri, code)
        conn = http.client.HTTPSConnection(base_url)
        conn.request('GET', path)
        response = json.loads(conn.getresponse().read())
        has_access_token = ('access_token' in response)
        if not has_access_token or 'error' in response:
            raise service_utils.req_error(code='INVALID', path='code', message='The code you provided is invalid.')
        data = 'facebook verified' # TODO: determine what the text should be
        claim_type = 3 # TODO: determine claim type integer code for phone verification
        signature = attestations.generate_signature(web3, signing_account, req.eth_address, claim_type, data)
        return verification.VerifyFacebookResponse(signature=signature, claim_type=claim_type, data=data)

    def twitter_auth_url(self, req):
        client = oauth.Client(oauth_consumer)
        resp, content = client.request(twitter_request_token_url, 'GET')
        if resp['status'] != '200':
            raise Exception('Invalid response from Twitter.')
        request_token_bytes = dict(cgi.parse_qsl(content))
        request_token = {}
        request_token['oauth_token'] = request_token_bytes[b'oauth_token'].decode('utf-8')
        request_token['oauth_token_secret'] = request_token_bytes[b'oauth_token_secret'].decode('utf-8')
        session['request_token'] = request_token
        url = '{}?oauth_token={}'.format(twitter_authenticate_url, request_token['oauth_token'])
        return verification.TwitterAuthUrlResponse(url=url)

    def verify_twitter(self, req):
        # Verify authenticity of user
        token = oauth.Token(session['request_token']['oauth_token'],
            session['request_token']['oauth_token_secret'])
        token.set_verifier(req.oauth_verifier)
        client = oauth.Client(oauth_consumer, token)
        resp, content = client.request(twitter_access_token_url, 'GET')
        access_token = dict(cgi.parse_qsl(content))
        if resp['status'] != '200' or not b'oauth_token' in access_token:
            raise service_utils.req_error(code='INVALID', path='oauth_verifier', message='The verifier you provided is invalid.')

        # Create attestation
        data = 'twitter verified' # TODO: determine what the text should be
        claim_type = 4 # TODO: determine claim type integer code for phone verification
        signature = attestations.generate_signature(web3, signing_account, req.eth_address, claim_type, data)
        return verification.VerifyTwitterResponse(signature=signature, claim_type=claim_type, data=data)

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

def send_code_via_email(address, code):
    from_email = Email(settings.SENDGRID_FROM_EMAIL)
    to_email = Email(address)
    subject = 'Your Origin Verification Code'
    content = Content('text/plain', 'Your Origin verification code is {}. It will expire in 30 minutes.'.format(code))
    mail = Mail(from_email, subject, to_email, content)
    sg.client.mail.send.post(request_body=mail.get())

def append_trailing_slash(url):
    if url.endswith('/'):
        return url
    return url + '/'
