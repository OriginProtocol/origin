from web3 import Web3

from database import db
from database.db_models import Listing, EventTracker
from util.contract import ContractHelper
from util.ipfs import hex_to_base58, IPFSHelper


def get_event_action(event):
    return {
        Web3.sha3(text='NewListing(uint256)').hex(): create_or_update_listing,
    }.get(event)


def update_event_counter(block_number):
    event_tracker = EventTracker.query.first()
    event_tracker.last_read = block_number
    db.session.commit()


def event_reducer(payload):
    event_hash = payload['topics'][0].hex()
    event_action = get_event_action(event_hash)
    if event_action:
        event_action(payload)
        update_event_counter(payload['blockNumber'])


def create_or_update_listing(payload):
    contract_helper = ContractHelper()
    contract = contract_helper.get_instance('ListingsRegistry',
                                            payload['address'])
    registry_index = contract_helper.convert_event_data('NewListing',
                                                        payload['data'])
    listing_data = contract.functions.getListing(registry_index).call()
    listing_obj = Listing.query.filter_by(
        contract_address=listing_data[0]).first()

    exclude_ipfs_fields = ['pictures']

    if not listing_obj:
        ipfs_data = IPFSHelper().file_from_hash(
            hex_to_base58(
                listing_data[2]),
            root_attr='data',
            exclude_fields=exclude_ipfs_fields)

        listing_obj = Listing(contract_address=listing_data[0],
                              owner_address=listing_data[1],
                              ipfs_hash=hex_to_base58(listing_data[2]),
                              ipfs_data=ipfs_data,
                              registry_id=registry_index,
                              price=Web3.fromWei(listing_data[3], 'ether'),
                              units=listing_data[4]
                              )
        db.session.add(listing_obj)
    else:
        if listing_obj.ipfs_hash != hex_to_base58(listing_data[2]):
            listing_obj.ipfs_hash = hex_to_base58(listing_data[2])
            listing_obj.ipfs_data = IPFSHelper().file_from_hash(hex_to_base58(
                listing_data[2]), root_attr='data',
                exclude_fields=exclude_ipfs_fields)
        listing_obj.price = Web3.fromWei(listing_data[3], 'ether')
        listing_obj.units = listing_data[4]
    db.session.commit()


def create_or_update_purchase(payload):
    pass
