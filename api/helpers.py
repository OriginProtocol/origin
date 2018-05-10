from marshmallow import Schema, fields, ValidationError
from logic.service_utils import ServiceError


class StandardRequest(Schema):
    pass


class StandardResponse(Schema):
    errors = fields.List(fields.Str)


def handle_request(data, handler, request_schema, response_schema):
    try:
        req = request_schema().load(data)
    # Handle validation errors
    except ValidationError as validation_err:
        errors = []
        for attr, msg in validation_err.messages.items():
            errors.append("%s: %s" % (attr, " ".join(msg).lower()))
        resp = {
            'errors': errors
        }
        return response_schema().dump(resp), 422
    try:
        resp = handler(**req)
        return response_schema().dump(resp.data), 200
    # Handle custom errors we have explicitly thrown from our services
    except ServiceError as service_err:
        resp = {
            'errors': [str(service_err)]
        }
        return response_schema().dump(resp), 422
