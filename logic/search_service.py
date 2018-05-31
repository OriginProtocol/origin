import logging

from elasticsearch import Elasticsearch
from urllib.parse import urlparse

from config import settings


class SearchIndexer():
    """
    SearchIndexer indexes events in a search engine.

    In prod environment, this implementation uses "Bonsai ElasticSearch" which
    is a hosted solution provided as a Heroku Add-on.
    """

    def __init__(self, client=None):
        if client:
            # A client may get passed to inject a mock for testing.
            self.client = client
        elif settings.DEBUG:
            # Point to local ElasticSearch instance running on local host.
            self.client = Elasticsearch()
        else:
            # Prod environment. Parse the BONSAI_URL env variable.
            assert settings.BONSAI_URL
            url = urlparse(settings.BONSAI_URL)

            # Connect to cluster over SSL using auth for best security.
            es_header = [{
                'host': url.hostname,
                'port': 443,
                'use_ssl': True,
                'http_auth': (url.username, url.password),
            }]

            # Instantiate an Elasticsearch client.
            self.client = Elasticsearch(es_header)

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

        # Index the doc.
        res = self.client.index(
            index="origin",
            doc_type='listing',
            id=doc_id,
            body=doc)

        # TODO(franck): implement retry/error policy.
        if res['result'] not in ('created', 'updated'):
            logging.error("Failed indexing listing", res, listing_data)

    def create_or_update_purchase(self, purchase_data):
        # TODO(franck): delete the Listing from the index if no unit left.
        pass

    def create_or_update_review(self, review_data):
        # TODO(gagan): implement
        pass
