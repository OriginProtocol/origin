from flask import jsonify, request
from marshmallow import Schema, ValidationError

from config import settings
from logic.service_utils import ServiceError


class StandardRequest(Schema):
    pass


class StandardResponse(Schema):
    pass


class SafeResponse(object):
    data = None
    errors = None


def safe_handler(call):
    def __call_handler(*args, **kargs):
        rsp = SafeResponse()
        # TODO:wrap a try catch around the handler_call for errors
        # catch errors and set it in the response...
        rsp.data = call(*args, **kargs)
        return rsp
    return __call_handler


def handle_request(data, handler, request_schema, response_schema):
    try:
        req = request_schema().load(data)
        resp = handler(**req)
        return response_schema().dump(resp.data), 200
    except ValidationError as validation_err:
        # Handle validation errors
        response = jsonify({
            'errors': validation_err.normalized_messages()
        })
        response.status_code = 400
        return response
    except ServiceError as service_err:
        # Handle custom errors we have explicitly thrown from our services
        response = jsonify({
            'errors': [str(service_err)]
        })
        response.status_code = service_err.status_code
        return response


def internal_api(method):
    """
    Decorator for internal API routes.
    Checks for presence of the internal API token.

    Raises:
        ValidationError
    """
    def check_token(*args, **kwargs):
        """
        Checks the header contains the expected internal API token.
        """
        token = request.headers.get('X-Internal-API-Token')
        if token is None or token != settings.INTERNAL_API_TOKEN:
            raise ValidationError("Invalid token")
        return method(*args, **kwargs)

    return check_token
