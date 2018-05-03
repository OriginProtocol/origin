import json
import hexbytes
from web3 import Web3, HTTPProvider, WebsocketProvider
from web3.contract import Contract
from web3.middleware import geth_poa_middleware
from eth_abi import decode_single
from eth_utils import to_checksum_address

from config import settings


class ContractHelper:

    def __init__(self):
        if settings.RPC_PROTOCOL == 'https':
            self.web3 = Web3(HTTPProvider(settings.RPC_SERVER))
        elif settings.RPC_PROTOCOL == 'wss':
            self.web3 = Web3(WebsocketProvider(settings.RPC_SERVER))

        # add geth poa middleware to handle overflowing extraData field
        # https://ethereum.stackexchange.com/a/44131
        self.web3.middleware_stack.inject(geth_poa_middleware, layer=0)

    def fetch_events(self, event_names, f,
                     block_from=0, block_to='latest'):
        event_name_hashes = []
        for name in event_names:
            event_name_hashes.append(self.web3.sha3(text=name).hex())
        self.event_filter = self.web3.eth.filter({
            "topics": [event_name_hashes],
            "fromBlock": block_from,
            "toBlock": block_to
        })
        for event in self.event_filter.get_all_entries():
            f(event)

    def get_instance(self, contract_name, address):
        abi = self.get_contract_abi(contract_name)
        contract = self.web3.eth.contract(
            abi=abi,
            address=Web3.toChecksumAddress(address),
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
    def convert_event_data(cls, event_type, data):
        if event_type == 'NewListing':
            return int(data, 0)
        elif event_type == 'ListingPurchased':
            addr = decode_single('address',
                                 hexbytes.HexBytes(data))
            return to_checksum_address(addr)
        elif event_type == 'PurchaseChange':
            return int(data, 0)

    @staticmethod
    def numeric_eth(str_eth_address):
        return int(str_eth_address, 16)

def get_contract_internal_name(contract):
    # create a 40 byte placeholder used in linked contracts
    contract_slice = contract[:36]
    return "__{contract_slice}{suffix}".format(contract_slice=contract_slice,
                                               suffix=(38-len(contract_slice)) * '_')
