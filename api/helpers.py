from flask import jsonify
from marshmallow import Schema, ValidationError
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
