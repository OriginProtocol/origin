import logging

from marshmallow import ValidationError

from database import db
from database.db_models import Listing, Purchase, Review
from logic.service_utils import DatabaseIndexingError
from util.ipfs import IPFSHelper


class DatabaseIndexer():
    """
    DatabaseIndexer persists events in a relational database.
    """
    @classmethod
    def create_or_update_listing(cls, listing_data):
        """
        TODO(franck): Deprecate once new JS EventListener is implemented.

        Creates a new or updates an existing Listing row in the database.
        """
        listing_obj = Listing.query.filter_by(
            contract_address=listing_data['contract_address']).first()

        # Load IPFS data. Note: we filter out pictures since those should
        # not get persisted in the database.
        listing_data['ipfs_data'] = \
            IPFSHelper().file_from_hash(listing_data['ipfs_hash'],
                                        root_attr='data',
                                        exclude_fields=['pictures'])

        if not listing_obj:
            # No existing Listing in the DB.
            # Download content from IPFS then insert new row in the DB.
            listing_obj = Listing(**listing_data)
            db.session.add(listing_obj)
        else:
            # Update existing Listing in the DB.
            if listing_obj.ipfs_hash != listing_data['ipfs_hash']:
                listing_obj.ipfs_hash = listing_data['ipfs_hash']
                listing_obj.ipfs_data = listing_data['ipfs_data']
            listing_obj.price = listing_data['price']
            listing_obj.units = listing_data['units']
        db.session.commit()
        return listing_obj

    @classmethod
    def create_or_update_purchase(cls, purchase_data):
        """
        TODO(franck): Deprecate once new JS EventListener is implemented.

        Creates a new or updates an existing Purchase row in the database.
        """
        purchase_obj = Purchase.query.filter_by(
            contract_address=purchase_data['contract_address']).first()

        listing_obj = Listing.query.filter_by(
            contract_address=purchase_data['listing_address']).first()

        if not listing_obj:
            return None

        if not purchase_obj:
            purchase_obj = Purchase(**purchase_data)
            db.session.add(purchase_obj)
        else:
            if purchase_obj.stage != purchase_data['stage']:
                purchase_obj.stage = purchase_data['stage']
        db.session.commit()
        return purchase_obj

    @classmethod
    def create_or_update_review(cls, review_data):
        """
        TODO(franck): Deprecate once new JS EventListener is implemented.


        Creates a new Review row in the database.
        Not sure if we would have updates on Review, sticking to classmethod
        naming covention for now.
        """
        # Load review data (which includes review text) from IPFS.
        review_data['ipfs_data'] = \
            IPFSHelper().file_from_hash(review_data['ipfs_hash'])
        review_obj = Review(**review_data)
        db.session.add(review_obj)
        db.session.commit()
        return review_obj

    @classmethod
    def index_listing(cls, listing):
        """
        Indexes a listing.

        Args:
            listing(dict): JSON representation of the listing to index.

        Raises:
            SearchIndexingError
        """
        # Look for the contract's address. It is used as a unique document ID
        # in the search index.
        contract_address = listing.get("contract_address")
        if not contract_address:
            raise ValidationError("Contract address missing.")

        # TODO(franck): Implement this logic. Will probably require updating
        #    the listing table database schema.
        try:
            logging.info("Indexing listing: %s", listing)
        except Exception as e:
            logging.error("Database indexing failure: %s", str(e))
            raise DatabaseIndexingError("Failed indexing listing.")
