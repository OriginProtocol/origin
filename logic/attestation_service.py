import cgi
import datetime
import http.client
import json
import requests
import secrets
import sendgrid
import re

from marshmallow.exceptions import ValidationError
from urllib.request import Request, urlopen, HTTPError, URLError
from sendgrid.helpers.mail import Email, Content, Mail

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

    def send_phone_verification(country_calling_code, phone, method, locale):
        """Request a phone number verification using the Twilio Verify API.

        Args:
            country_calling_code (str): Dialling prefix for the country.
            phone (str): Phone number in national format.
            method (str): Method of verification, 'sms' or 'call'.
            locale (str): Language of the verification.

        Returns:
            VerificationServiceResponse

        Raises:
            ValidationError: Verification request failed due to invalid arguments
            PhoneVerificationError: Verification request failed for a reason not
                related to the arguments
        """
        params = {
            'country_code': country_calling_code,
            'phone_number': phone,
            'via': method,
            'code_length': 6
        }
        if locale:
            # Locale is provided explicitly
            # If a locale is not set Twilio will use a sensible default based on
            # the country of the telephone number
            params['locale'] = locale

        headers = {
            'X-Authy-API-Key': settings.TWILIO_VERIFY_API_KEY
        }

        url = 'https://api.authy.com/protected/json/phones/verification/start'
        response = requests.post(url, params=params, headers=headers)

        try:
            response.raise_for_status()
        except requests.exceptions.HTTPError as exc:
            if response.json()['error_code'] == "60033":
                raise ValidationError('Phone number is invalid.',
                                      field_names=['phone'])
            elif response.json()['error_code'] == "60082":
                raise ValidationError('Cannot send SMS to landline.',
                                      field_names=['phone'])
            else:
                # Remaining error codes are due to Twilio account issues or
                # configuration of API key.
                # See https://www.twilio.com/docs/verify/return-and-error-codes
                raise PhoneVerificationError(
                    'Could not send verification code. Please try again shortly.'
                )

        return VerificationServiceResponse()

    def verify_phone(country_calling_code, phone, code, eth_address):
        """Check a phone verification code against the Twilio Verify API for a
        phone number.

        Args:
            country_calling_code (str): Dialling prefix for the country.
            phone (str): Phone number in national format.
            code (int): Verification code for the country_calling_code and phone
                combination

        Returns:
            VerificationServiceResponse

        Raises:
            ValidationError: Verification request failed due to invalid arguments
            PhoneVerificationError: Verification request failed for a reason not
                related to the arguments
        """
        params = {
            'country_code': country_calling_code,
            'phone_number': phone,
            'verification_code': code
        }

        headers = {
            'X-Authy-API-Key': settings.TWILIO_VERIFY_API_KEY
        }

        url = 'https://api.authy.com/protected/json/phones/verification/status'
        response = requests.get(url, params=params, headers=headers)

        try:
            response.raise_for_status()
        except requests.exceptions.HTTPError as exc:
            if response.json()['error_code'] == '60023':
                # This error code could also mean that no phone verification was ever
                # created for that country calling code and phone number
                raise ValidationError('Verification code has expired.',
                                      field_names=['code'])
            elif response.json()['error_code'] == '60022':
                raise ValidationError('Verification code is incorrect.',
                                      field_names=['code'])
            else:
                raise PhoneVerificationError(
                    'Could not verify code. Please try again shortly.'
                )

        if response.json()['success'] is True:
            # This may be unnecessary because the response has a 200 status code
            # but it a good precaution to handle any inconsistency between the
            # success field and the status code
            data = 'phone verified'
            # TODO: determine claim type integer code for phone verification
            signature = attestations.generate_signature(
                signing_key, eth_address, CLAIM_TYPES['phone'], data)
            return VerificationServiceResponse({
                'signature': signature,
                'claim_type': CLAIM_TYPES['phone'],
                'data': data
            })

        raise PhoneVerificationError(
            'Could not verify code. Please try again shortly.'
        )

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
                ' a new verification code.', status_code=429)
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
        if not re.compile(r"^\d*$").match(airbnbUserId):
            raise AirbnbVerificationError('AirbnbUserId should be a number.')

        return VerificationServiceResponse({
            'code': get_airbnb_verification_code(eth_address, airbnbUserId)
        })

    def verify_airbnb(eth_address, airbnbUserId):
        if not re.compile(r"^\d*$").match(airbnbUserId):
            raise AirbnbVerificationError('AirbnbUserId should be a number.')

        code = get_airbnb_verification_code(eth_address, airbnbUserId)

        # TODO: determine if this user agent is acceptable.
        # We need to set an user agent otherwise Airbnb returns 403
        request = Request(
            url='https://www.airbnb.com/users/show/' + airbnbUserId,
            headers={'User-Agent': 'Origin Protocol client-0.1.0'}
        )

        try:
            response = urlopen(request)
        except HTTPError as e:
            if e.code == 404:
                raise AirbnbVerificationError('Airbnb user id: ' + airbnbUserId + ' not found.')
            else:
                raise AirbnbVerificationError("Can not fetch user's Airbnb profile.")
        except URLError as e:
            raise AirbnbVerificationError("Can not fetch user's Airbnb profile.")

        if code not in response.read().decode('utf-8'):
            raise AirbnbVerificationError(
                "Origin verification code: " + code +
                " has not been found in user's Airbnb profile."
            )

        # TODO: determine the schema for claim data
        data = 'airbnbUserId:' + airbnbUserId
        signature = attestations.generate_signature(
            signing_key, eth_address, CLAIM_TYPES['airbnb'], data)

        return VerificationServiceResponse({
            'signature': signature,
            'claim_type': CLAIM_TYPES['airbnb'],
            'data': data
        })


def get_airbnb_verification_code(eth_address, airbnbUserid):
    # take the last 7 bytes of the hash
    hashCode = Web3.sha3(text=eth_address + airbnbUserid)[:7]

    with open("./{}/mnemonic_words_english.txt".format(settings.RESOURCES_DIR)) as f:
        mnemonicWords = f.readlines()
        # convert those bytes to mnemonic phrases
        return ' '.join(
            list(
                map(
                    lambda i: mnemonicWords[int(i)].rstrip(), hashCode
                )
            )
        )


def numeric_eth(str_eth_address):
    return int(str_eth_address, 16)


# Generates a six-digit numeric token.
def random_numeric_token():
    # Don't use tokens that are close to 0 that will look stupid to users.
    rand = secrets.randbelow(1000000 - 1000)
    return '{0:06d}'.format(rand + 1000)


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
