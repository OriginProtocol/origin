from flask import request
from flask_restful import Resource
from marshmallow import Schema, fields
from logic.attestation_service import VerificationService
from api.helpers import StandardRequest, StandardResponse, handle_request


class PubAuditableUrl(Schema):
    challenge = fields.Str()
    proofUrl = fields.Str()


class VerificationMethod(Schema):
    oAuth = fields.Boolean()
    sms = fields.Boolean()
    call = fields.Boolean()
    email = fields.Boolean()
    mail = fields.Boolean()
    human = fields.Boolean()
    pubAuditableUrl = fields.Nested(PubAuditableUrl)


class Hash(Schema):
    function = fields.Str()
    value = fields.Str()


class Attribute(Schema):
    raw = fields.Str()
    verified = fields.Boolean()
    hash = fields.Nested(Hash)


class Site(Schema):
    siteName = fields.Str()
    userId = fields.Nested(Attribute)
    username = fields.Nested(Attribute)
    profileUrl = fields.Nested(Attribute)


class Attestation(Schema):
    verificationMethod = fields.Nested(VerificationMethod)
    email = fields.Nested(Attribute)
    phone = fields.Nested(Attribute)
    site = fields.Nested(Site)


class Issuer(Schema):
    name = fields.Str()
    url = fields.Str()
    ethAddress = fields.Str()


class AttestationData(Schema):
    issuer = fields.Nested(Issuer)
    issueDate = fields.Str()
    attestation = fields.Nested(Attestation)


class Signature(Schema):
    bytes = fields.Str()
    version = fields.Str()


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
    schemaId = fields.Str(required=True)
    data = fields.Nested(AttestationData, required=True)
    signature = fields.Nested(Signature, required=True)


class EmailVerificationCodeRequest(StandardRequest):
    email = fields.Email(required=True)


class EmailVerificationCodeResponse(StandardResponse):
    pass


class VerifyEmailRequest(StandardRequest):
    eth_address = fields.Str(required=True, data_key='identity')
    email = fields.Email(required=True)
    code = fields.Str(required=True)


class VerifyEmailResponse(StandardResponse):
    schemaId = fields.Str(required=True)
    data = fields.Nested(AttestationData, required=True)
    signature = fields.Nested(Signature, required=True)


class FacebookAuthUrlRequest(StandardRequest):
    pass


class FacebookAuthUrlResponse(StandardResponse):
    url = fields.Url()


class VerifyFacebookRequest(StandardRequest):
    eth_address = fields.Str(required=True, data_key='identity')
    code = fields.Str(required=True)


class VerifyFacebookResponse(StandardResponse):
    schemaId = fields.Str(required=True)
    data = fields.Nested(AttestationData, required=True)
    signature = fields.Nested(Signature, required=True)


class TwitterAuthUrlRequest(StandardRequest):
    pass


class TwitterAuthUrlResponse(StandardResponse):
    url = fields.Url()


class VerifyTwitterRequest(StandardRequest):
    eth_address = fields.Str(required=True, data_key='identity')
    oauth_verifier = fields.Str(required=True, data_key='oauth-verifier')


class VerifyTwitterResponse(StandardResponse):
    schemaId = fields.Str(required=True)
    data = fields.Nested(AttestationData, required=True)
    signature = fields.Nested(Signature, required=True)


class AirbnbRequest(StandardRequest):
    eth_address = fields.Str(required=True, data_key='identity')
    airbnbUserId = fields.Str(required=True)


class AirbnbVerificationCodeResponse(StandardResponse):
    code = fields.Str()


class VerifyAirbnbResponse(StandardResponse):
    schemaId = fields.Str(required=True)
    data = fields.Nested(AttestationData, required=True)
    signature = fields.Nested(Signature, required=True)


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
