class ServiceError(Exception):
    pass


def req_error(code=None, path=None, message=None):
    return ServiceError({'code': code, 'message': message, 'path': path})
