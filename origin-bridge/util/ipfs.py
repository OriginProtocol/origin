import json
import base58
import ipfsapi

from hexbytes import HexBytes

from config import settings


def hex_to_base58(byte32_hex):
    """
    Converts IPFS hash stored in contract to base58.

    IPFS hashes are base58 encoded but are stored using a different
    encoding in the smart contract in order to save space
    (and therefore minimize gas cost when recording a transaction).
    For details see https://ethereum.stackexchange.com/a/17112/20332
    """
    # Add our default ipfs values for first 2 bytes:
    # function:0x12=sha2, size:0x20=256 bits converted to bytes: \x12
    # and cut off leading "0x"
    hash_hex = b'\x12 ' + byte32_hex
    return base58.b58encode(hash_hex)


def base58_to_hex(hash):
    return HexBytes(base58.b58decode(hash)[2:])


class IPFSHelper:

    def __init__(self):
        self.connector = ipfsapi.Client(settings.IPFS_DOMAIN,
                                        settings.IPFS_PORT)

    def file_from_hash(self, ipfs_hash, root_attr=None, exclude_fields=None):
        ipfs_data = json.loads(self.connector.cat(ipfs_hash))
        ipfs_data = ipfs_data[root_attr] if root_attr else ipfs_data
        if exclude_fields:
            for field in exclude_fields:
                ipfs_data.pop(field, None)
        return ipfs_data

    def directly_pinned_hashes(self, pin_types=None):
        """
        Returns the hashes of IPFS objects that are directly pinned (as opposed
        to those that are indirectly pinned through some other recursively
        pinned hash).
        """
        pin_types = ['direct', 'recursive']
        pinned_keys = self.connector.pin_ls()['Keys']
        return [k[0] for k in pinned_keys.items() if k[1]['Type'] in pin_types]

    def add_json(self, json):
        return self.connector.add_json(json)

    def pin_hashes(self, *hashes):
        return self.connector.pin_add(*hashes)

    def unpin_hashes(self, *hashes):
        return self.connector.pin_rm(*hashes, recursive=True)
