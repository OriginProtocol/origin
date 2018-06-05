import json

from mock import MagicMock

from logic.search import SearchClient


class TestSearchClient():

    def test_search_listing(self):
        """
        Issues various searches and checks the client sends
        valid JSON queries to the backend.
        """
        backend_mock = MagicMock()
        backend_mock.search.return_value = {"hits": {"hits": []}}
        client = SearchClient(client=backend_mock)

        client.listings("foo")
        backend_mock.search_listings.assert_called()
        _, kwargs = backend_mock.search_listings.call_args
        query = kwargs["body"]
        json.loads(query)

        client.listings("bar", category="cat", location="earth", num=3, offset=4)
        backend_mock.search_listings.assert_called()
        _, kwargs = backend_mock.search_listings.call_args
        query = kwargs["body"]
        req = json.loads(query)
        assert req["size"] == 3
        assert req["from"] == 4
