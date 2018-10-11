import logging
import json
from web3 import Web3, HTTPProvider, WebsocketProvider
from web3.contract import Contract
from web3.middleware import geth_poa_middleware

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
        logging.info("Fetching events from block %s to block %s" %
                     (block_from, block_to))

        event_name_hashes = []
        for name in event_names:
            event_name_hashes.append(self.web3.sha3(text=name).hex())
        self.event_filter = self.web3.eth.filter({
            "topics": [event_name_hashes],
            "fromBlock": block_from,
            "toBlock": block_to
        })

        num_events_fetched = len(self.event_filter.get_all_entries())
        logging.info("Fetched %d events" % num_events_fetched)

        process_events = False
        num_events_processed = 0
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
                num_events_processed += 1

        logging.info("Processed %d events", num_events_processed)

    def get_instance(self, contract_name, address):
        abi = self.get_contract_abi(contract_name)
        address = Web3.toChecksumAddress(address)
        contract = self.web3.eth.contract(abi=abi,
                                          address=address,
                                          ContractFactoryClass=Contract)
        return contract

    @classmethod
    def get_contract_abi(cls, contract_name):
        with open("./{}/{}.json".format(settings.CONTRACT_DIR, contract_name)) as f:
            contract_interface = json.loads(f.read())
        return contract_interface['abi']

    @classmethod
    def get_contract_bytecode(cls, contract_name):
        with open("./{}/{}.json".format(settings.CONTRACT_DIR, contract_name)) as f:
            contract_interface = json.loads(f.read())
        return contract_interface['bytecode']

    @classmethod
    def get_contract_enums(cls, contract_name, enum_name):
        with open("./{}/{}.json".format(settings.CONTRACT_DIR, contract_name)) as f:
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

    @staticmethod
    def numeric_eth(str_eth_address):
        return int(str_eth_address, 16)


def get_contract_internal_name(contract):
    # create a 40 byte placeholder used in linked contracts
    contract_slice = contract[:36]
    return "__{name}{suffix}".format(name=contract_slice,
                                     suffix=(38 - len(contract_slice)) * '_')
