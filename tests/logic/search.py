from patch import MagicMock

from logic.search import SearchClient


class TestSearchClient():

    def test_search_listing(self):
        client = SearchClient(client=MagicMock())
        client.listings("foo")
        client.listing("bar", category="cat", location="earth", num=3, offset=4)
