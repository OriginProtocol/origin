import json
import hexbytes
from web3 import Web3, HTTPProvider, WebsocketProvider
from web3.contract import Contract
from web3.middleware import geth_poa_middleware
from eth_abi import decode_single, decode_abi
from eth_utils import to_checksum_address

from config import settings
from enum import Enum


class ContractHelper:

    def __init__(self, web3=None):
        if web3:
            self.web3 = web3
        elif settings.RPC_PROTOCOL == 'https':
            self.web3 = Web3(HTTPProvider(settings.RPC_SERVER))

            # add geth poa middleware to handle overflowing extraData field
            # https://ethereum.stackexchange.com/a/44131
            self.web3.middleware_stack.inject(geth_poa_middleware, layer=0)
        elif settings.RPC_PROTOCOL == 'wss':
            self.web3 = Web3(WebsocketProvider(settings.RPC_SERVER))
            self.web3.middleware_stack.inject(geth_poa_middleware, layer=0)

    def fetch_events(self, event_names, callback,
                     log_index, transaction_index,
                     block_from=0, block_to='latest'):
        """
        Makes an RPC call to the Ethereum network to fetch events by name.
        Calls the callback function for each event fetched, if any.

        Args:
            event_names(list[str]): List of event names.
            callback(function(event)): Callback function
        """
        event_name_hashes = []
        for name in event_names:
            event_name_hashes.append(self.web3.sha3(text=name).hex())
        self.event_filter = self.web3.eth.filter({
            "topics": [event_name_hashes],
            "fromBlock": block_from,
            "toBlock": block_to
        })

        process_events = False

        for event in self.event_filter.get_all_entries():
            if block_from == event['blockNumber']:
                if transaction_index == event['transactionIndex']\
                        and log_index == event['logIndex']:
                    # switch on the process_events flag and continue since
                    # we last read uptil this point
                    process_events = True
                    continue
            elif block_from < event['blockNumber']:
                # case to process the first event ever
                process_events = True

            if process_events:
                callback(event)

    def get_instance(self, contract_name, address):
        abi = self.get_contract_abi(contract_name)
        address = Web3.toChecksumAddress(address)
        contract = self.web3.eth.contract(abi=abi,
                                          address=address,
                                          ContractFactoryClass=Contract)
        return contract

    @classmethod
    def get_contract_abi(cls, contract_name):
        with open("./contracts/{}.json".format(contract_name)) as f:
            contract_interface = json.loads(f.read())
        return contract_interface['abi']

    @classmethod
    def get_contract_bytecode(cls, contract_name):
        with open("./contracts/{}.json".format(contract_name)) as f:
            contract_interface = json.loads(f.read())
        return contract_interface['bytecode']

    @classmethod
    def get_contract_enums(cls, contract_name, enum_name):
        with open("./contracts/{}.json".format(contract_name)) as f:
            contract_interface = json.loads(f.read())
        for root_node in contract_interface['ast']['nodes']:
            if root_node.get("nodeType") == "ContractDefinition" and root_node.get(
                    "name") == contract_name:
                for node in root_node["nodes"]:
                    if node.get("canonicalName") == "%s.%s" % (
                            contract_name, enum_name):
                        members = node.get("members")
                        if members and isinstance(members, list):
                            return Enum(enum_name, " ".join(
                                e["name"] for e in members), start=0)

    @classmethod
    def convert_event_data(cls, event_type, data):
        if event_type == 'NewListing':
            return decode_abi(['uint256', 'address'], hexbytes.HexBytes(data))
        elif event_type == 'ListingPurchased':
            addr = decode_single('address',
                                 hexbytes.HexBytes(data))
            return to_checksum_address(addr)
        elif event_type == 'PurchaseChange':
            return int(data, 0)
        elif event_type == 'PurchaseReview':
            return decode_abi(['address', 'address', 'uint8',
                               'uint8', 'bytes32'], hexbytes.HexBytes(data))

    @staticmethod
    def numeric_eth(str_eth_address):
        return int(str_eth_address, 16)


def get_contract_internal_name(contract):
    # create a 40 byte placeholder used in linked contracts
    contract_slice = contract[:36]
    return "__{name}{suffix}".format(name=contract_slice,
                                     suffix=(38 - len(contract_slice)) * '_')
