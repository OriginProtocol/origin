from database.db_models import Listing
from logic.indexer_service import (create_or_update_listing)


def test_new_listing_create(web3, wait_for_block,
                            wait_for_transaction, listing_contract):
    address = listing_contract.address
    create_or_update_listing(address, web3=web3)
    assert Listing.query.filter_by(contract_address=address).first()
