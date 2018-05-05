import cgi
import datetime
import http.client
import json
import oauth2 as oauth
import secrets
import sendgrid

from sendgrid.helpers.mail import Email, Content, Mail
from twilio.rest import Client
from twilio.base.exceptions import TwilioRestException

from config import settings
from database import db
from database import db_models
from flask import session
from logic.service_utils import (
    PhoneVerificationError,
    EmailVerificationError,
    FacebookVerificationError,
    TwitterVerificationError
)
from sqlalchemy import func
from util import time_, attestations
from web3 import Web3, HTTPProvider

# TODO: use env vars to connect to live networks
web3 = Web3(HTTPProvider('http://localhost:9545'))
signing_key = settings.ORIGIN_SIGNING_KEY

VC = db_models.VerificationCode

sg = sendgrid.SendGridAPIClient(apikey=settings.SENDGRID_API_KEY)

oauth_consumer = oauth.Consumer(
    settings.TWITTER_CONSUMER_KEY, settings.TWITTER_CONSUMER_SECRET)

twitter_request_token_url = 'https://api.twitter.com/oauth/request_token'
twitter_authenticate_url = 'https://api.twitter.com/oauth/authenticate'
twitter_access_token_url = 'https://api.twitter.com/oauth/access_token'

CODE_EXPIRATION_TIME_MINUTES = 30


class VerificationServiceResponse():
    def __init__(self, data={}):
        self.data = data


class VerificationService:
    def generate_phone_verification_code(phone):
        db_code = VC.query \
            .filter(VC.phone == phone) \
            .first()
        if db_code is None:
            db_code = db_models.VerificationCode()
            db.session.add(db_code)
        elif (time_.utcnow() - db_code.updated_at).total_seconds() < 10:
            # If the client has requested a verification code already within
            # the last 10 seconds,
            # throw a rate limit error, so they can't just keep creating codes
            # and guessing them
            # rapidly.
            raise PhoneVerificationError(
                'Please wait briefly before requesting'
                ' a new verification code.')
        db_code.phone = phone
        db_code.code = random_numeric_token()
        db_code.expires_at = time_.utcnow(
        ) + datetime.timedelta(minutes=CODE_EXPIRATION_TIME_MINUTES)
        db.session.commit()
        try:
            send_code_via_sms(phone, db_code.code)
        except TwilioRestException as e:
            db.session.rollback()
            raise PhoneVerificationError(
                'Could not send'
                ' verification code.')
        return VerificationServiceResponse()

    def verify_phone(phone, code, eth_address):
        db_code = VC.query \
            .filter(VC.phone == phone) \
            .first()
        if db_code is None:
            raise PhoneVerificationError(
                'The given phone number was not found.')
        if code != db_code.code:
            raise PhoneVerificationError('The code you provided'
                                         ' is invalid.')
        if time_.utcnow() > db_code.expires_at:
            raise PhoneVerificationError('The code you provided'
                                         ' has expired.')
        # TODO: determine what the text should be
        data = 'phone verified'
        # TODO: determine claim type integer code for phone verification
        claim_type = 10
        signature = attestations.generate_signature(
            web3, signing_key, eth_address, claim_type, data)
        return VerificationServiceResponse({
            'signature': signature,
            'claim_type': claim_type,
            'data': data
        })

    def generate_email_verification_code(email):
        db_code = VC.query \
            .filter(func.lower(VC.email) == func.lower(email)) \
            .first()
        if db_code is None:
            db_code = db_models.VerificationCode()
            db.session.add(db_code)
        elif (time_.utcnow() - db_code.updated_at).total_seconds() < 10:
            # If the client has requested a verification code already within
            # the last 10 seconds, throw a rate limit error, so they can't just
            # keep creating codes and guessing them rapidly.
            raise EmailVerificationError(
                'Please wait briefly before requesting'
                ' a new verification code.')
        db_code.email = email
        db_code.code = random_numeric_token()
        db_code.expires_at = time_.utcnow() + datetime.timedelta(
            minutes=CODE_EXPIRATION_TIME_MINUTES)
        db.session.commit()
        send_code_via_email(email, db_code.code)
        return VerificationServiceResponse()

    def verify_email(email, code, eth_address):
        db_code = VC.query \
            .filter(func.lower(VC.email) == func.lower(email)) \
            .first()
        if db_code is None:
            raise EmailVerificationError('The given email was'
                                         ' not found.')
        if code != db_code.code:
            raise EmailVerificationError('The code you provided'
                                         ' is invalid.')
        if time_.utcnow() > db_code.expires_at:
            raise EmailVerificationError('The code you provided'
                                         ' has expired.')

        # TODO: determine what the text should be
        data = 'email verified'
        # TODO: determine claim type integer code for email verification
        claim_type = 11
        signature = attestations.generate_signature(
            web3, signing_key, eth_address, claim_type, data)
        return VerificationServiceResponse({
            'signature': signature,
            'claim_type': claim_type,
            'data': data
        })

    def facebook_auth_url(redirect_url):
        client_id = settings.FACEBOOK_CLIENT_ID
        redirect_uri = append_trailing_slash(redirect_url)
        url = ('https://www.facebook.com/v2.12/dialog/oauth?client_id={}'
               '&redirect_uri={}').format(client_id, redirect_uri)
        return VerificationServiceResponse({'url': url})

    def verify_facebook(redirect_url, code, eth_address):
        base_url = 'graph.facebook.com'
        client_id = settings.FACEBOOK_CLIENT_ID
        client_secret = settings.FACEBOOK_CLIENT_SECRET
        redirect_uri = append_trailing_slash(redirect_url)
        code = code
        path = ('/v2.12/oauth/access_token?client_id={}'
                '&client_secret={}&redirect_uri={}&code={}').format(
                    client_id, client_secret, redirect_uri, code)
        conn = http.client.HTTPSConnection(base_url)
        conn.request('GET', path)
        response = json.loads(conn.getresponse().read())
        has_access_token = ('access_token' in response)
        if not has_access_token or 'error' in response:
            raise FacebookVerificationError(
                'The code you provided is invalid.')
        # TODO: determine what the text should be
        data = 'facebook verified'
        # TODO: determine claim type integer code for phone verification
        claim_type = 3
        signature = attestations.generate_signature(
            web3, signing_key, eth_address, claim_type, data)
        return VerificationServiceResponse({
            'signature': signature,
            'claim_type': claim_type,
            'data': data
        })

    def twitter_auth_url():
        client = oauth.Client(oauth_consumer)
        resp, content = client.request(twitter_request_token_url, 'GET')
        if resp['status'] != '200':
            raise TwitterVerificationError('Invalid response from Twitter.')
        as_bytes = dict(cgi.parse_qsl(content))
        token_b = as_bytes[b'oauth_token']
        token_secret_b = as_bytes[b'oauth_token_secret']
        request_token = {}
        request_token['oauth_token'] = token_b.decode('utf-8')
        request_token['oauth_token_secret'] = token_secret_b.decode('utf-8')
        session['request_token'] = request_token
        url = '{}?oauth_token={}'.format(
            twitter_authenticate_url,
            request_token['oauth_token'])
        return VerificationServiceResponse({'url': url})

    def verify_twitter(oauth_verifier, eth_address):
        # Verify authenticity of user
        if 'request_token' not in session:
            raise TwitterVerificationError('Session not found.')
        token = oauth.Token(session['request_token']['oauth_token'],
                            session['request_token']['oauth_token_secret'])
        token.set_verifier(oauth_verifier)
        client = oauth.Client(oauth_consumer, token)
        resp, content = client.request(twitter_access_token_url, 'GET')
        access_token = dict(cgi.parse_qsl(content))
        if resp['status'] != '200' or b'oauth_token' not in access_token:
            raise TwitterVerificationError(
                'The verifier you provided is invalid.')

        # Create attestation
        # TODO: determine what the text should be
        data = 'twitter verified'
        # TODO: determine claim type integer code for phone verification
        claim_type = 4
        signature = attestations.generate_signature(
            web3, signing_key, eth_address, claim_type, data)
        return VerificationServiceResponse({
            'signature': signature,
            'claim_type': claim_type,
            'data': data
        })


def numeric_eth(str_eth_address):
    return int(str_eth_address, 16)


# Generates a six-digit numeric token.
def random_numeric_token():
    # Don't use tokens that are close to 0 that will look stupid to users.
    rand = secrets.randbelow(1000000 - 1000)
    return '{0:06d}'.format(rand + 1000)


def send_code_via_sms(phone, code):
    client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
    try:
        client.messages.create(
            to=phone,
            from_=settings.TWILIO_NUMBER,
            body=('Your Origin verification code is {}.'
                  ' It will expire in 30 minutes.').format(code))
    except TwilioRestException as e:
        raise e


def send_code_via_email(address, code):
    from_email = Email(settings.SENDGRID_FROM_EMAIL)
    to_email = Email(address)
    subject = 'Your Origin Verification Code'
    content = Content(
        'text/plain',
        ('Your Origin verification code is {}.'
         ' It will expire in 30 minutes.').format(code))
    mail = Mail(from_email, subject, to_email, content)
    sg.client.mail.send.post(request_body=mail.get())


def append_trailing_slash(url):
    if url.endswith('/'):
        return url
    return url + '/'
