import json
import pytest

from util.contract import get_contract_internal_name
from util.ipfs import base58_to_hex


@pytest.fixture()
def purchase_lib_contract(web3, wait_for_transaction, wait_for_block):
    contract_name = 'PurchaseLibrary'
    with open("./contracts/{}.json".format(contract_name)) as f:
            contract_interface = json.loads(f.read())
    wait_for_block(web3)

    CONTRACT_META = {
        "abi": contract_interface['abi'],
        "bytecode": contract_interface['bytecode']
    }

    contract = web3.eth.contract(**CONTRACT_META)
    deploy_txn_hash = contract.constructor().transact({'from': web3.eth.coinbase,
                                                       'gas': 1000000})
    deploy_receipt = wait_for_transaction(web3, deploy_txn_hash)
    contract_address = deploy_receipt['contractAddress']
    return contract(address=contract_address)


@pytest.fixture()
def listing_registry_contract(web3, wait_for_transaction, wait_for_block,
                              purchase_lib_contract):
    contract_name = 'ListingsRegistry'
    linked_contract = 'PurchaseLibrary'
    with open("./contracts/{}.json".format(contract_name)) as f:
            contract_interface = json.loads(f.read())
    wait_for_block(web3)

    CONTRACT_META = {
        "abi": contract_interface['abi'],
        "bytecode": contract_interface['bytecode'].replace(get_contract_internal_name(linked_contract),
                                                           purchase_lib_contract.address[2:])}

    contract = web3.eth.contract(**CONTRACT_META)
    deploy_txn_hash = contract.constructor()\
        .transact({'from': web3.eth.coinbase, 'gas': 1000000})
    deploy_receipt = wait_for_transaction(web3, deploy_txn_hash)
    contract_address = deploy_receipt['contractAddress']
    return contract(address=contract_address)


@pytest.fixture()
def listing_contract(web3, wait_for_transaction, wait_for_block,
                     purchase_lib_contract, listing_registry_contract):
    contract_name = 'Listing'
    linked_contract = 'PurchaseLibrary'
    with open("./contracts/{}.json".format(contract_name)) as f:
            contract_interface = json.loads(f.read())
    wait_for_block(web3)

    CONTRACT_META = {
        "abi": contract_interface['abi'],
        "bytecode": contract_interface['bytecode'].replace(get_contract_internal_name(linked_contract),
                                                           purchase_lib_contract.address[2:])}

    contract = web3.eth.contract(**CONTRACT_META)
    deploy_txn_hash = contract.constructor(purchase_lib_contract.address,base58_to_hex("QmZtQDL4UjQWryQLjsS5JUsbdbn2B27Tmvz2gvLkw7wmmb"),
                                           3, 25).transact({'from': web3.eth.coinbase,
                                                       'gas': 1000000})
    deploy_receipt = wait_for_transaction(web3, deploy_txn_hash)
    contract_address = deploy_receipt['contractAddress']
    return contract(address=contract_address)
