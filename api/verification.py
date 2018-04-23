import apilib


class GeneratePhoneVerificationCodeRequest(apilib.Request):
    eth_address = apilib.Field(apilib.String(), required=True)
    phone = apilib.Field(apilib.String(), required=True)


class GeneratePhoneVerificationCodeResponse(apilib.Response):
    pass


class VerifyPhoneRequest(apilib.Request):
    eth_address = apilib.Field(apilib.String(), required=True)
    phone = apilib.Field(apilib.String(), required=True)
    code = apilib.Field(apilib.String(), required=True)


class VerifyPhoneResponse(apilib.Response):
    # A successful response will have response_code SUCCESS.
    # Any invalid code with have response_code REQUEST_ERROR
    # and the 'errors' list will be populated.
    attestation = apilib.Field(apilib.String())


class VerificationService(apilib.Service):
    path = '/api/verification_service'
    methods = apilib.servicemethods(
        apilib.Method('generate_phone_verification_code', GeneratePhoneVerificationCodeRequest, GeneratePhoneVerificationCodeResponse),
        apilib.Method('verify_phone', VerifyPhoneRequest, VerifyPhoneResponse))
