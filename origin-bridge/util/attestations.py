from web3 import Web3
from web3.auto.http import w3
from web3.exceptions import InvalidAddress
from eth_account.messages import defunct_hash_message
from logic.service_utils import AccountNotFoundError

# http://web3py.readthedocs.io/en/stable/web3.eth.account.html?highlight=private#not-acceptable-for-production
w3.eth.enable_unaudited_features()


def generate_signature(private_key, subject, data):
    try:
        hash_to_sign = Web3.soliditySha3(
            ['address', 'bytes32'],
            [Web3.toChecksumAddress(subject), Web3.sha3(text=data)]
        )

        result = w3.eth.account.signHash(
            message_hash=defunct_hash_message(hexstr=hash_to_sign.hex()),
            private_key=private_key)
    except InvalidAddress:
        raise AccountNotFoundError("The specified account was not found.")
    return result['signature'].hex()
