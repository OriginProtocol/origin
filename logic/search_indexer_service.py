import logging

from marshmallow import ValidationError

from logic.search import SearchClient
from logic.service_utils import SearchIndexingError


class SearchIndexer():
    """
    SearchIndexer indexes events in a search engine.
    """

    def __init__(self, client=None):
        self.client = client if client else SearchClient.instance()

    def create_or_update_listing(self, listing_data):
        # Create a doc for indexing.
        ipfs_data = listing_data['ipfs_data']
        doc = {
            'name': ipfs_data.get('name'),
            'category': ipfs_data.get('category'),
            'description': ipfs_data.get('description'),
            'location': ipfs_data.get('location'),
            'price': listing_data['price'],
        }
        # Use the Listing's contract address as unique doc id.
        doc_id = listing_data['contract_address']

        # Index the listing.
        self.client.index_listing(doc_id, doc)

    def create_or_update_purchase(self, purchase_data):
        # TODO(franck): delete the Listing from the index if no unit left.
        pass

    def create_or_update_review(self, review_data):
        # TODO(gagan): implement
        pass

    def index_listing(self, listing):
        """
        Indexes a listing.

        Args:
            listing(dict): JSON representation of the listing to index.

        Raises:
            SearchIndexingError
        """
        # Look for the contract's address. It is used as a unique document ID
        # in the search index.
        address = listing.get("contract_address")
        if not address:
            raise ValidationError("Contract address missing.")

        # TODO(franck): validate listing against schema before indexing it.
        try:
            self.client.index_listing(doc_id=address, doc=listing)
        except Exception as e:
            logging.error("Indexing failure: %s", str(e))
            raise SearchIndexingError("Failed indexing listing.")
