class ServiceError(Exception): pass
class PhoneVerificationError(ServiceError): pass
class EmailVerificationError(ServiceError): pass
class FacebookVerificationError(ServiceError): pass
class TwitterVerificationError(ServiceError): pass

def req_error(code=None, path=None, message=None):
    return ServiceError({'code': code, 'message': message, 'path': path})

