from marshmallow import Schema, fields, ValidationError
from logic import service_utils


class StandardRequest(Schema):
    pass


class StandardResponse(Schema):
    errors = fields.List(
        fields.Dict(
            code=fields.Str(),
            path=fields.Str(),
            message=fields.Str()
        )
    )


def handle_request(data, handler, request_schema, response_schema):
    try:
        req = request_schema().load(data)
    # Handle validation errors
    except ValidationError as validation_err:
        errors = []
        for attr, msg in validation_err.messages.items():
            errors.append({
                'code': 'INVALID_REQUEST',
                'path': attr,
                'message': ' '.join(msg)
            })
        resp = {
            'errors': errors
        }
        return response_schema().dump(resp), 400
    try:
        resp = handler(req) or {}
        return response_schema().dump(resp), 200
    # Handle custom errors we have explicitly thrown from our services
    except service_utils.ServiceError as service_err:
        resp = {
            'errors': [{
                'code': service_err.args[0]['code'],
                'message': service_err.args[0]['message']
            }]
        }
        return response_schema().dump(resp), 422
