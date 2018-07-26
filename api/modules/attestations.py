from flask import request
from flask_restful import Resource
from marshmallow import fields
from logic.attestation_service import VerificationService
from api.helpers import StandardRequest, StandardResponse, handle_request


class PhoneVerificationCodeRequest(StandardRequest):
    country_calling_code = fields.Str(required=True)
    phone = fields.Str(required=True)
    method = fields.Str(missing='sms')
    locale = fields.Str(missing=None)


class PhoneVerificationCodeResponse(StandardResponse):
    pass


class VerifyPhoneRequest(StandardRequest):
    eth_address = fields.Str(required=True, data_key='identity')
    country_calling_code = fields.Str(required=True)
    phone = fields.Str(required=True)
    code = fields.Str(required=True)


class VerifyPhoneResponse(StandardResponse):
    signature = fields.Str()
    claim_type = fields.Integer(data_key='claim-type')
    data = fields.Str(required=True)


class EmailVerificationCodeRequest(StandardRequest):
    email = fields.Email(required=True)


class EmailVerificationCodeResponse(StandardResponse):
    pass


class VerifyEmailRequest(StandardRequest):
    eth_address = fields.Str(required=True, data_key='identity')
    email = fields.Email(required=True)
    code = fields.Str(required=True)


class VerifyEmailResponse(StandardResponse):
    signature = fields.Str()
    claim_type = fields.Integer(data_key='claim-type')
    data = fields.Str()


class FacebookAuthUrlRequest(StandardRequest):
    pass


class FacebookAuthUrlResponse(StandardResponse):
    url = fields.Url()


class VerifyFacebookRequest(StandardRequest):
    eth_address = fields.Str(required=True, data_key='identity')
    code = fields.Str(required=True)


class VerifyFacebookResponse(StandardResponse):
    signature = fields.Str()
    claim_type = fields.Integer(data_key='claim-type')
    data = fields.Str()


class TwitterAuthUrlRequest(StandardRequest):
    pass


class TwitterAuthUrlResponse(StandardResponse):
    url = fields.Url()


class VerifyTwitterRequest(StandardRequest):
    eth_address = fields.Str(required=True, data_key='identity')
    oauth_verifier = fields.Str(required=True, data_key='oauth-verifier')


class VerifyTwitterResponse(StandardResponse):
    signature = fields.Str()
    claim_type = fields.Integer(data_key='claim-type')
    data = fields.Str()


class AirbnbRequest(StandardRequest):
    eth_address = fields.Str(required=True, data_key='identity')
    airbnbUserId = fields.Str(required=True)


class AirbnbVerificationCodeResponse(StandardResponse):
    code = fields.Str()


class VerifyAirbnbResponse(StandardResponse):
    signature = fields.Str()
    claim_type = fields.Integer(data_key='claim-type')
    data = fields.Str()


class PhoneVerificationCode(Resource):
    def post(self):
        return handle_request(
            data=request.json,
            handler=VerificationService.send_phone_verification,
            request_schema=PhoneVerificationCodeRequest,
            response_schema=PhoneVerificationCodeResponse)


class VerifyPhone(Resource):
    def post(self):
        return handle_request(
            data=request.json,
            handler=VerificationService.verify_phone,
            request_schema=VerifyPhoneRequest,
            response_schema=VerifyPhoneResponse)


class EmailVerificationCode(Resource):
    def post(self):
        return handle_request(
            data=request.json,
            handler=VerificationService.send_email_verification,
            request_schema=EmailVerificationCodeRequest,
            response_schema=EmailVerificationCodeResponse)


class VerifyEmail(Resource):
    def post(self):
        return handle_request(
            data=request.json,
            handler=VerificationService.verify_email,
            request_schema=VerifyEmailRequest,
            response_schema=VerifyEmailResponse)


class FacebookAuthUrl(Resource):
    def get(self):
        return handle_request(
            data=request.values,
            handler=VerificationService.facebook_auth_url,
            request_schema=FacebookAuthUrlRequest,
            response_schema=FacebookAuthUrlResponse)


class VerifyFacebook(Resource):
    def post(self):
        return handle_request(
            data=request.json,
            handler=VerificationService.verify_facebook,
            request_schema=VerifyFacebookRequest,
            response_schema=VerifyFacebookResponse)


class TwitterAuthUrl(Resource):
    def get(self):
        return handle_request(
            data=request.values,
            handler=VerificationService.twitter_auth_url,
            request_schema=TwitterAuthUrlRequest,
            response_schema=TwitterAuthUrlResponse)


class VerifyTwitter(Resource):
    def post(self):
        return handle_request(
            data=request.json,
            handler=VerificationService.verify_twitter,
            request_schema=VerifyTwitterRequest,
            response_schema=VerifyTwitterResponse)


class AirbnbVerificationCode(Resource):
    def get(self):
        return handle_request(
            data=request.values,
            handler=VerificationService.generate_airbnb_verification_code,
            request_schema=AirbnbRequest,
            response_schema=AirbnbVerificationCodeResponse)


class VerifyAirbnb(Resource):
    def post(self):
        return handle_request(
            data=request.json,
            handler=VerificationService.verify_airbnb,
            request_schema=AirbnbRequest,
            response_schema=VerifyAirbnbResponse)


resources = {
    'phone/generate-code': PhoneVerificationCode,
    'phone/verify': VerifyPhone,
    'email/generate-code': EmailVerificationCode,
    'email/verify': VerifyEmail,
    'facebook/auth-url': FacebookAuthUrl,
    'facebook/verify': VerifyFacebook,
    'twitter/auth-url': TwitterAuthUrl,
    'twitter/verify': VerifyTwitter,
    'airbnb/generate-code': AirbnbVerificationCode,
    'airbnb/verify': VerifyAirbnb
}
