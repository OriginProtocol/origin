from web3 import Web3

def generate_signature(web3, signer, subject, claim_type, data):
    hashed_data = Web3.sha3(text=data)
    hash_to_sign = Web3.soliditySha3(['address', 'uint256', 'bytes32'], [subject, claim_type, hashed_data])
    signature = web3.eth.sign(signer, data=hash_to_sign)
    return signature.hex()
