from database.db_models import Listing, Purchase
from logic.indexer_service import (create_or_update_listing,
                                   create_or_update_purchase,)


def test_new_listing_create(db, web3, wait_for_block,
                            wait_for_transaction, listing_contract, mock_ipfs):
    address = listing_contract.address
    create_or_update_listing(address, web3=web3)
    assert Listing.query.filter_by(contract_address=address).count() == 1


def test_new_purchase_create(db, web3, wait_for_block,
                             wait_for_transaction, listing_contract,
                             purchase_contract, mock_ipfs):
    create_or_update_listing(listing_contract.address, web3=web3)
    create_or_update_purchase(purchase_contract.address, web3=web3)
    assert Listing.query\
        .filter_by(contract_address=listing_contract.address).count() == 1
    assert Purchase.query\
        .filter_by(contract_address=purchase_contract.address,
                   listing_address=listing_contract.address).count() == 1
