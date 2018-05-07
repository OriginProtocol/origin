from web3 import Web3

from database import db
from database.db_models import Listing, EventTracker, Purchase
from util.contract import ContractHelper
from util.ipfs import hex_to_base58, IPFSHelper
from util.time_ import unix_to_datetime
from logic.notifier_service import notify_purchased, notify_listing, notify_listing_update


def get_event_action(event):
    return {
        Web3.sha3(text='NewListing(uint256)').hex(): new_listing,
        Web3.sha3(text='ListingPurchased(address)').hex(): listing_purchased,
        Web3.sha3(text='ListingChange()').hex(): listing_change,
        Web3.sha3(text='PurchaseChange(Stages)').hex(): purchase_change,
    }.get(event)


def update_event_counter(block_number):
    event_tracker = EventTracker.query.first()
    event_tracker.last_read = block_number
    db.session.commit()


def event_reducer(payload, web3=None):
    event_hash = payload['topics'][0].hex()
    event_action = get_event_action(event_hash)
    if event_action:
        event_action(payload, web3)
        update_event_counter(payload['blockNumber'])


def new_listing(payload, web3=None):
    contract_helper = ContractHelper(web3)
    contract = contract_helper.get_instance('ListingsRegistry',
                                            payload['address'])
    registry_index = contract_helper.convert_event_data('NewListing',
                                                        payload['data'])
    listing_data = contract.functions.getListing(registry_index).call()
    notify_listing(create_or_update_listing(listing_data[0]))


def listing_change(payload, web3=None):
    notify_listing_update(create_or_update_listing(Web3.toChecksumAddress(payload['address']),
                             web3))

def listing_purchased(payload, web3=None):
    address = ContractHelper.convert_event_data('ListingPurchased',
                                                payload['data'])
    notify_purchased(create_or_update_purchase(address,
                              web3))


def purchase_change(payload, web3=None):
    notify_purchased(create_or_update_purchase(Web3.toChecksumAddress(payload['address']),
                              web3))

def create_or_update_listing(address, web3=None):
    contract_helper = ContractHelper(web3)
    contract = contract_helper.get_instance('Listing',
                                            address)
    listing_data = {
        "contract_address": address,
        "owner_address": contract.call().owner(),
        "ipfs_hash": hex_to_base58(contract.call().ipfsHash()),
        "units": contract.call().unitsAvailable(),
        "price": Web3.fromWei(contract.call().price(), 'ether'),

    }

    listing_obj = Listing.query\
        .filter_by(contract_address=listing_data['contract_address']).first()

    exclude_ipfs_fields = ['pictures']

    if not listing_obj:
        listing_data['ipfs_data'] = \
            IPFSHelper().file_from_hash(listing_data['ipfs_hash'],
                                        root_attr='data',
                                        exclude_fields=exclude_ipfs_fields)
        listing_obj = Listing(**listing_data)
        db.session.add(listing_obj)
    else:
        if listing_obj.ipfs_hash != listing_data['ipfs_hash']:
            listing_obj.ipfs_hash = listing_data['ipfs_hash']
            listing_data['ipfs_data'] = \
                IPFSHelper().file_from_hash(listing_data['ipfs_hash'],
                                            root_attr='data',
                                            exclude_fields=exclude_ipfs_fields)
            listing_obj.ipfs_data = listing_data['ipfs_data']

        listing_obj.price = listing_data['price']
        listing_obj.units = listing_data['units']
    db.session.commit()
    return listing_obj


def create_or_update_purchase(address, web3=None):
    contract = ContractHelper(web3).get_instance('Purchase',
                                                 address)

    contract_data = contract.functions.data().call()
    purchase_data = {
        "contract_address": address,
        "buyer_address": contract_data[2],
        "listing_address": contract_data[1],
        "stage": contract_data[0],
        "created_at": unix_to_datetime(contract_data[3]),
        "buyer_timeout": unix_to_datetime(contract_data[4])
    }

    purchase_obj = Purchase.query\
        .filter_by(contract_address=purchase_data['contract_address']).first()

    if not purchase_obj:
        purchase_obj = Purchase(**purchase_data)
        db.session.add(purchase_obj)
    else:
        if purchase_obj.stage != purchase_data['stage']:
            purchase_obj.stage = purchase_data['stage']
    db.session.commit()
    return purchase_obj
