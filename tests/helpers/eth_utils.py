from web3 import Web3

sample_eth_address = 562046206989085878832492993516240920558397288279


def str_eth(numeric_eth_address):
    return Web3.toChecksumAddress(hex(int(numeric_eth_address)))
