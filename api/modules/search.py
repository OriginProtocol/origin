from flask import request
from flask_restful import Resource
from marshmallow import fields

from api.helpers import StandardRequest, StandardResponse, handle_request, safe_handler
from logic.search import SearchClient


class ListingsRequest(StandardRequest):
    offset = fields.Int(required=False)
    num = fields.Int(required=False)
    location = fields.Str(required=False)
    category = fields.Str(required=False)
    query = fields.Str(required=True)


class ListingsResponse(StandardResponse):
    listings = fields.List(fields.Dict())


class SearchListings(Resource):
    def get(self):
        search_client = SearchClient.instance()
        return handle_request(
            data=request.values,
            handler=safe_handler(search_client.listings),
            request_schema=ListingsRequest,
            response_schema=ListingsResponse)


resources = {
    'listings': SearchListings,
}
