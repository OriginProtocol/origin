import json
import base58
import ipfsapi

from config import settings


def hex_to_base58(byte32_hex):
    # Add our default ipfs values for first 2 bytes:
    # function:0x12=sha2, size:0x20=256 bits converted to bytes: \x12
    # and cut off leading "0x"
    hash_hex = b'\x12 ' + byte32_hex
    return base58.b58encode(hash_hex)


class IPFSHelper:

    def __init__(self):
        self.connector = ipfsapi.connect(settings.IPFS_DOMAIN,
                                         settings.IPFS_PORT)

    def file_from_hash(self, ipfs_hash, root_attr=None, exclude_fields=None):
        if not exclude_fields:
            exclude_fields = []
        ipfs_data = json.loads(self.connector.cat(ipfs_hash))
        ipfs_data = ipfs_data[root_attr] if root_attr else ipfs_data
        for field in exclude_fields:
            ipfs_data.pop(field, None)
        return ipfs_data
