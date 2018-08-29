class ServiceError(Exception):
    """Base exception for custom errors."""

    def __init__(self, message, status_code=422):
        Exception.__init__(self)
        self.message = message
        self.status_code = status_code

    def __str__(self):
        return self.message


class AccountNotFoundError(ServiceError):
    pass


class AirbnbVerificationError(ServiceError):
    pass


class EmailVerificationError(ServiceError):
    pass


class FacebookVerificationError(ServiceError):
    pass


class PhoneVerificationError(ServiceError):
    pass


class TwitterVerificationError(ServiceError):
    pass


def req_error(code=None, path=None, message=None):
    return ServiceError({'code': code, 'message': message, 'path': path})
