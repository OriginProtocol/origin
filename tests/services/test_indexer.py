from mock import MagicMock

from database.db_models import Listing, Purchase
from logic.db_indexer_service import DatabaseIndexer
from logic.event_handler import (
    EventHandler,
)


class TestDatabaseBIndexer():

    def test_new_listing_and_purchase(
            self, db, web3, wait_for_block,
            wait_for_transaction, listing_contract,
            purchase_contract, mock_ipfs):

        handler = EventHandler(
            notifier=MagicMock(), search_indexer=MagicMock(), web3=web3)
        listing_data = handler._fetch_listing_data(listing_contract.address)
        purchase_data = handler._fetch_purchase_data(purchase_contract.address)

        db_indexer = DatabaseIndexer()
        db_indexer.create_or_update_listing(listing_data)
        db_indexer.create_or_update_purchase(purchase_data)

        # We expect rows to have been inserted in the listing and purchase
        # tables.
        assert Listing.query\
            .filter_by(contract_address=listing_contract.address).count() == 1
        assert Purchase.query\
            .filter_by(contract_address=purchase_contract.address,
                       listing_address=listing_contract.address).count() == 1
