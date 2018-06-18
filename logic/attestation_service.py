import cgi
import datetime
import http.client
import json
import requests
import secrets
import sendgrid
import re
import urllib.request

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
    TwitterVerificationError,
    AirbnbVerificationError
)
from requests_oauthlib import OAuth1
from sqlalchemy import func
from util import time_, attestations, urls
from web3 import Web3

signing_key = settings.ATTESTATION_SIGNING_KEY

VC = db_models.VerificationCode

sg = sendgrid.SendGridAPIClient(apikey=settings.SENDGRID_API_KEY)

twitter_request_token_url = 'https://api.twitter.com/oauth/request_token'
twitter_authenticate_url = 'https://api.twitter.com/oauth/authenticate'
twitter_access_token_url = 'https://api.twitter.com/oauth/access_token'

CODE_EXPIRATION_TIME_MINUTES = 30

CLAIM_TYPES = {
    'phone': 10,
    'email': 11,
    'facebook': 3,
    'twitter': 4,
    'airbnb': 5
}


class VerificationServiceResponse():
    def __init__(self, data={}):
        self.data = data


class VerificationService:
    def generate_phone_verification_code(phone):
        phone = normalize_number(phone)

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
        phone = normalize_number(phone)

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
        signature = attestations.generate_signature(
            signing_key, eth_address, CLAIM_TYPES['phone'], data)
        return VerificationServiceResponse({
            'signature': signature,
            'claim_type': CLAIM_TYPES['phone'],
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
        signature = attestations.generate_signature(
            signing_key, eth_address, CLAIM_TYPES['email'], data)
        return VerificationServiceResponse({
            'signature': signature,
            'claim_type': CLAIM_TYPES['email'],
            'data': data
        })

    def facebook_auth_url():
        client_id = settings.FACEBOOK_CLIENT_ID
        redirect_uri = urls.absurl("/redirects/facebook/")
        url = ('https://www.facebook.com/v2.12/dialog/oauth?client_id={}'
               '&redirect_uri={}').format(client_id, redirect_uri)
        return VerificationServiceResponse({'url': url})

    def verify_facebook(code, eth_address):
        base_url = 'graph.facebook.com'
        client_id = settings.FACEBOOK_CLIENT_ID
        client_secret = settings.FACEBOOK_CLIENT_SECRET
        redirect_uri = urls.absurl("/redirects/facebook/")
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
        signature = attestations.generate_signature(
            signing_key, eth_address, CLAIM_TYPES['facebook'], data)
        return VerificationServiceResponse({
            'signature': signature,
            'claim_type': CLAIM_TYPES['facebook'],
            'data': data
        })

    def twitter_auth_url():
        callback_uri = urls.absurl("/redirects/twitter/")
        oauth = OAuth1(
            settings.TWITTER_CONSUMER_KEY,
            settings.TWITTER_CONSUMER_SECRET,
            callback_uri=callback_uri)
        r = requests.post(url=twitter_request_token_url, auth=oauth)
        if r.status_code != 200:
            raise TwitterVerificationError('Invalid response from Twitter.')
        as_bytes = dict(cgi.parse_qsl(r.content))
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
        oauth = OAuth1(
            settings.TWITTER_CONSUMER_KEY,
            settings.TWITTER_CONSUMER_SECRET,
            session['request_token']['oauth_token'],
            session['request_token']['oauth_token_secret'],
            verifier=oauth_verifier)
        r = requests.post(url=twitter_access_token_url, auth=oauth)
        if r.status_code != 200:
            raise TwitterVerificationError(
                'The verifier you provided is invalid.')

        # Create attestation
        # TODO: determine what the text should be
        data = 'twitter verified'
        # TODO: determine claim type integer code for phone verification
        signature = attestations.generate_signature(
            signing_key, eth_address, CLAIM_TYPES['twitter'], data)
        return VerificationServiceResponse({
            'signature': signature,
            'claim_type': CLAIM_TYPES['twitter'],
            'data': data
        })

    def generate_airbnb_verification_code(eth_address, airbnbUserId):
        if not re.compile("^\d*$").match(airbnbUserId):
            raise AirbnbVerificationError('AirbnbUserId should be a number.')

        return VerificationServiceResponse({'code': generate_airbnb_verification_code(eth_address, airbnbUserId)})

    def verify_airbnb(eth_address, airbnbUserId):
        code = generate_airbnb_verification_code(eth_address, airbnbUserId)

        response = urllib.request.urlopen('https://www.airbnb.com/users/show/' + airbnbUserId)

        if not re.compile(".*" + code + ".*").match(response.read()):
            raise AirbnbVerificationError("Origin verification code: " + code + " has not been found in user's Airbnb profile.")
        
        data = airbnbUserId
        signature = attestations.generate_signature(
            signing_key, eth_address, CLAIM_TYPES['airbnb'], data)

        return VerificationServiceResponse({
            'signature': signature,
            'claim_type': CLAIM_TYPES['airbnb'],
            'data': data
        })


def generate_airbnb_verification_code(eth_address, airbnbUserid):
    # might make sense to add salt to this function, but on the other hand it is open source
    return Web3.sha3(text=eth_address + airbnbUserid).hex()[:10]


def normalize_number(phone):
    try:
        lookup = get_twilio_client().lookups.phone_numbers(phone).fetch()
        return lookup.national_format
    except TwilioRestException as e:
        raise PhoneVerificationError('Invalid phone number.')


def numeric_eth(str_eth_address):
    return int(str_eth_address, 16)


# Generates a six-digit numeric token.
def random_numeric_token():
    # Don't use tokens that are close to 0 that will look stupid to users.
    rand = secrets.randbelow(1000000 - 1000)
    return '{0:06d}'.format(rand + 1000)


def send_code_via_sms(phone, code):
    try:
        get_twilio_client().messages.create(
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


# proxy function so that we can do caching on this later on if we want to
def get_twilio_client():
    return Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
