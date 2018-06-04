from mock import MagicMock

from database.db_models import EventTracker, Listing, Purchase
from logic.indexer_service import DatabaseIndexer, EventHandler
from util.contract import ContractHelper


class TestEventHandler():

    def _assert_listing_and_purchase_mock_calls(self, mock_db_indexer,
                                                mock_notifier,
                                                mock_search_indexer):
        # Handler should have received NEW_LISTING and LISTING_CHANGE events.
        assert mock_db_indexer.create_or_update_listing.call_count == 2
        assert mock_notifier.notify_listing.call_count == 1
        assert mock_notifier.notify_listing_update.call_count == 1
        assert mock_search_indexer.create_or_update_listing.call_count == 2

        # Handler should have received a LISTING_PURCHASED event.
        assert mock_db_indexer.create_or_update_purchase.call_count > 1
        assert mock_notifier.notify_purchased.call_count > 1
        assert mock_search_indexer.create_or_update_purchase.call_count > 1

        # Handler should have received a PURCHASE_REVIEW event.
        assert mock_db_indexer.create_or_update_review.call_count == 1
        assert mock_notifier.notify_review.call_count == 1
        assert mock_search_indexer.create_or_update_review.call_count == 1

    def test_new_listing_and_purchase(
            self, db, web3, wait_for_block, wait_for_transaction,
            listing_registry_contract, listing_contract, purchase_contract,
            mock_ipfs, purchase_stage_buyer_pending):
        # Init the event tracker so that it can be updated by EventHandler.
        event_tracker = EventTracker(block_index=0,
                                     transaction_index=0,
                                     log_index=0)
        db.session.add(event_tracker)
        db.session.commit()

        # Create an EventHandler with mock handlers then fetch and process
        # the events that should have been emitted when the listing and
        # purchase contracts were created.
        mock_db_indexer = MagicMock()
        mock_notifier = MagicMock()
        mock_search_indexer = MagicMock()
        handler = EventHandler(db_indexer=mock_db_indexer,
                               notifier=mock_notifier,
                               search_indexer=mock_search_indexer,
                               web3=web3)

        ContractHelper(web3=web3).fetch_events(
            [],
            block_from=event_tracker.block_index,
            block_to='latest',
            callback=handler.process,
            log_index=event_tracker.log_index,
            transaction_index=event_tracker.transaction_index)
        self._assert_listing_and_purchase_mock_calls(
            mock_db_indexer, mock_notifier, mock_search_indexer)

        # fetch events once again and check if any duplicate events are
        # processed
        event_tracker = EventTracker.query.filter().first()
        ContractHelper(web3=web3).fetch_events(
            [],
            block_from=event_tracker.block_index,
            block_to='latest',
            callback=handler.process,
            log_index=event_tracker.log_index,
            transaction_index=event_tracker.transaction_index)
        self._assert_listing_and_purchase_mock_calls(
            mock_db_indexer, mock_notifier, mock_search_indexer)


class TestDBIndexer():

    def test_new_listing_and_purchase(
            self, db, web3, wait_for_block,
            wait_for_transaction, listing_contract,
            purchase_contract, mock_ipfs):

        handler = EventHandler(web3=web3)
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
