from web3 import Web3
from web3.auto import w3
from eth_account.messages import defunct_hash_message

# http://web3py.readthedocs.io/en/stable/web3.eth.account.html?highlight=private#not-acceptable-for-production
w3.eth.enable_unaudited_features()


def generate_signature(web3, private_key, subject, claim_type, data):
    hashed_data = Web3.sha3(text=data)
    hash_to_sign = Web3.soliditySha3(['address', 'uint256', 'bytes32'], [
                                     subject, claim_type, hashed_data])
    result = w3.eth.account.signHash(
        message_hash=defunct_hash_message(text=hash_to_sign.hex()),
        private_key=private_key)
    return result['signature'].hex()
