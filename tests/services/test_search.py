import pytest

from marshmallow import ValidationError
from mock import MagicMock

from logic.search_indexer_service import SearchIndexer
from logic.service_utils import SearchIndexingError


class TestSearchIndexer():

    def test_index_listing(self):
        client_mock = MagicMock()
        client_mock.index_listing = MagicMock(
            return_value={'result': 'created'})
        search_indexer = SearchIndexer(client_mock)

        # Test successful indexing.
        listing = {
            'contract_address': '0x94dE52186b535cB06cA31dEb1fBd4541A824aC6d',
            'title': 'test title',
            'description': 'test description',
        }
        search_indexer.index_listing(listing)

        # Test search-backend raising an exception.
        client_mock.index_listing.side_effect = Exception("failure !")
        with pytest.raises(SearchIndexingError):
            search_indexer.index_listing(listing)

        # Test missing contract address.
        listing = {
            'title': 'test title',
            'description': 'test description',
        }
        with pytest.raises(ValidationError):
            search_indexer.index_listing(listing)

    def test_create_or_update_listing(self):
        client_mock = MagicMock()
        client_mock.index_listing = MagicMock(
            return_value={'result': 'created'})
        search_indexer = SearchIndexer(client_mock)

        listing_data = {
            'contract_address': '0x94dE52186b535cB06cA31dEb1fBd4541A824aC6d',
            'ipfs_data': {
                'name': 'foo',
                'category': 'cat',
                'description': 'test listing',
                'location': 'earth',
            },
            'price': 123,
        }

        search_indexer.create_or_update_listing(listing_data)
        assert client_mock.index_listing.call_count == 1
