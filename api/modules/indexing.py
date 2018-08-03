from flask import request
from flask_restful import Resource
from marshmallow import fields

from api.helpers import (
    handle_request,
    internal_api,
    safe_handler,
    StandardRequest,
    StandardResponse,
)
from logic.db_indexer_service import DatabaseIndexer
from logic.search_indexer_service import SearchIndexer


class IndexListingRequest(StandardRequest):
    listing = fields.Dict(required=True)


class IndexListingResponse(StandardResponse):
    pass


class IndexListingSearch(Resource):

    @internal_api
    def put(self):
        """
        Indexes a listing in the search back-end.
        """
        indexer = SearchIndexer()
        return handle_request(
            data=request.json,
            handler=safe_handler(indexer.index_listing),
            request_schema=IndexListingRequest,
            response_schema=IndexListingResponse)


class IndexListingDatabase(Resource):

    @internal_api
    def put(self):
        """
        Indexes a listing in the database.
        """
        indexer = DatabaseIndexer()
        return handle_request(
            data=request.json,
            handler=safe_handler(indexer.index_listing),
            request_schema=IndexListingRequest,
            response_schema=IndexListingResponse)


resources = {
    'db/listing': IndexListingDatabase,
    'search/listing': IndexListingSearch,
}
