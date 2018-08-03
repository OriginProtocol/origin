import logging

from enum import Enum
from web3 import Web3

from database import db
from database.db_models import EventTracker, Review
from logic.db_indexer_service import DatabaseIndexer
from logic.notifier_service import Notifier
from logic.search_indexer_service import SearchIndexer
from util.contract import ContractHelper
from util.ipfs import hex_to_base58
from util.time_ import unix_to_datetime


class EventType(Enum):
    NEW_LISTING = 1
    LISTING_PURCHASED = 2
    LISTING_CHANGE = 3
    PURCHASE_CHANGE = 4
    PURCHASE_REVIEW = 5


EVENT_HASH_TO_EVENT_TYPE_MAP = {
    Web3.sha3(text='NewListing(uint256,address)').hex(): EventType.NEW_LISTING,
    Web3.sha3(text='ListingPurchased(address)').hex(): EventType.LISTING_PURCHASED,
    Web3.sha3(text='ListingChange()').hex(): EventType.LISTING_CHANGE,
    Web3.sha3(text='PurchaseChange(uint8)').hex(): EventType.PURCHASE_CHANGE,
    Web3.sha3(text='PurchaseReview(address,address,uint8,uint8,bytes32)').hex():
        EventType.PURCHASE_REVIEW,
}


class EmptyIPFSHashError(Exception):
    pass


NULL_BYTES32 = b'\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00' \
    b'\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00'


class EventHandler():
    """
    EventHandler receives contract events, loads any necessary additional data
    and calls the appropriate indexer or notifier backends.
    """

    def __init__(self, db_indexer=None, notifier=None,
                 search_indexer=None, web3=None):
        """
        Constructor with optional arguments that can be used to inject
        mocks for testing.
        """
        self.db_indexer = db_indexer if db_indexer else DatabaseIndexer()
        self.notifier = notifier if notifier else Notifier()
        self.search_indexer = search_indexer if search_indexer else SearchIndexer()
        self.web3 = web3

    @classmethod
    def _update_tracker(cls, block_index, log_index, transaction_index):
        """
        Updates the block_number in the event_tracker db table. This acts as
        a cursor to keep track of blocks that have been processed so far.
        """
        event_tracker = EventTracker.query.first()
        event_tracker.block_index = block_index
        event_tracker.transaction_index = transaction_index
        event_tracker.log_index = log_index
        db.session.commit()

    @classmethod
    def _get_event_type(cls, event_hash):
        """
        Returns EventType based on event_hash.
        """
        return EVENT_HASH_TO_EVENT_TYPE_MAP.get(event_hash)

    def _get_new_listing_address(self, event):
        """
        Returns the address of a new listing.

        Args:
            event(dict): A NewListing event.

        Returns:
            Address of the newly created Listing contract.
        """
        event_data = ContractHelper.convert_event_data('NewListing',
                                                       event['data'])
        # First element in data is the registry index, then second
        # is the address of the listing itself.
        address = Web3.toChecksumAddress(event_data[1])
        return address

    def _fetch_listing_data(self, address):
        """
        Fetches a Listing contract's data based on its address.
        """
        contract_helper = ContractHelper(self.web3)
        contract = contract_helper.get_instance('UnitListing', address)
        listing_data = {
            "contract_address": address,
            "owner_address": contract.call().owner(),
            "ipfs_hash": hex_to_base58(contract.call().ipfsHash()),
            "units": contract.call().unitsAvailable(),
            "price": Web3.fromWei(contract.call().price(), 'ether'),
        }
        return listing_data

    def _fetch_purchase_data(self, address):
        """
        Fetches a Purchase contract's data based on its address.
        """
        contract_helper = ContractHelper(self.web3)
        contract = contract_helper.get_instance('Purchase', address)

        contract_data = contract.functions.data().call()
        purchase_data = {
            "contract_address": address,
            "buyer_address": contract_data[2],
            "listing_address": contract_data[1],
            "stage": contract_data[0],
            "created_at": unix_to_datetime(contract_data[3]),
            "buyer_timeout": unix_to_datetime(contract_data[4])
        }
        return purchase_data

    def _get_review_data(self, event):
        """
        Parses and returns Review data from PurchaseReview event.
        """
        event_data = ContractHelper.convert_event_data('PurchaseReview',
                                                       event['data'])
        contract_address = Web3.toChecksumAddress(event['address'])

        # Due to a bug in our contract migration script, some events were
        # recorded on the Rinkeby and Ropsten test blockchains
        # with a null IPS hash.
        # See https://github.com/OriginProtocol/origin-js/issues/271
        ipfs_hash = event_data[4]
        if ipfs_hash == NULL_BYTES32:
            raise EmptyIPFSHashError

        review_data = {
            "contract_address": contract_address,
            "reviewer_address": event_data[0],
            "reviewee_address": event_data[1],
            "role": Review.ROLES[int(event_data[2])],
            "rating": int(event_data[3]),
            "ipfs_hash": hex_to_base58(ipfs_hash),
        }
        return review_data

    def process(self, event):
        """
        Processes an event by loading relevant data and calling
        indexer/notifier backends.

        TODO(franck): Filter out possible non-OriginProtocol events that
            could have the same hash as OriginProtocol ones.
        """
        event_hash = event['topics'][0].hex()
        event_type = self._get_event_type(event_hash)

        logging.debug("Processing event: type=%s event=%s",
                      event_type, event)

        try:
            if event_type == EventType.NEW_LISTING:
                address = self._get_new_listing_address(event)
                data = self._fetch_listing_data(address)
                listing_obj = self.db_indexer.create_or_update_listing(data)
                self.notifier.notify_listing(listing_obj)
                self.search_indexer.create_or_update_listing(data)

            elif event_type == EventType.LISTING_CHANGE:
                address = Web3.toChecksumAddress(event['address'])
                data = self._fetch_listing_data(address)
                listing_obj = self.db_indexer.create_or_update_listing(data)
                self.notifier.notify_listing_update(listing_obj)
                self.search_indexer.create_or_update_listing(data)

            elif event_type == EventType.LISTING_PURCHASED:
                address = ContractHelper.convert_event_data('ListingPurchased',
                                                            event['data'])
                data = self._fetch_purchase_data(address)
                purchase_obj = self.db_indexer.create_or_update_purchase(data)
                if purchase_obj is not None:
                    self.notifier.notify_purchased(purchase_obj)
                    self.search_indexer.create_or_update_purchase(data)

            elif event_type == EventType.PURCHASE_CHANGE:
                address = Web3.toChecksumAddress(event['address'])
                data = self._fetch_purchase_data(address)
                purchase_obj = self.db_indexer.create_or_update_purchase(data)
                if purchase_obj is not None:
                    self.notifier.notify_purchased(purchase_obj)
                    self.search_indexer.create_or_update_purchase(data)

            elif event_type == EventType.PURCHASE_REVIEW:
                data = self._get_review_data(event)
                review_obj = self.db_indexer.create_or_update_review(data)
                self.notifier.notify_review(review_obj)
                self.search_indexer.create_or_update_review(data)

            else:
                logging.error("Received unexpected event type %s hash %s",
                              event_type, event_hash)

        except EmptyIPFSHashError:
            # TODO: Handle as a critical error once we are live on mainnet.
            logging.error("Empty IPFS Hash. Skipping event %s", event)

        # After successfully processing the event, update the event tracker.
        self._update_tracker(block_index=event['blockNumber'],
                             log_index=event['logIndex'],
                             transaction_index=event['transactionIndex'])

        logging.debug("Finished processing event")
