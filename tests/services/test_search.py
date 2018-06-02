from mock import MagicMock

from logic.indexer_service import SearchIndexer


class TestSearchIndexer():

    def test_create_or_update_listing(self):
        client_mock = MagicMock()
        client_mock.index_listing = MagicMock(return_value={'result': 'created'})
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
