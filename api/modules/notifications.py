from flask import request
from flask_restful import Resource
from marshmallow import fields
from marshmallow_enum import EnumField

from logic.notifier_service import register_eth_notification, EthNotificationTypes
from api.helpers import StandardRequest, StandardResponse, handle_request, safe_handler


class RegisterEthNotificationRequest(StandardRequest):
    eth_address = fields.Str(required=True)
    device_token = fields.Str(required=True)
    type = EnumField(EthNotificationTypes, required=True)
    verification_signature = fields.Str()


class RegisterEthNotificationResponse(StandardResponse):
    pass


class EthEndpoint(Resource):
    def post(self):
        return handle_request(
            data=request.json,
            handler=safe_handler(register_eth_notification),
            request_schema=RegisterEthNotificationRequest,
            response_schema=RegisterEthNotificationResponse)


resources = {
    # 'hello-world-path': HelloWorldResource
    'eth-endpoint': EthEndpoint,
}
