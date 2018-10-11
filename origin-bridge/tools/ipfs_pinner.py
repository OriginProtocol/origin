#! /usr/bin/env python3

import argparse
import logging

from logic.event_handler import EventHandler
from tools import db_utils
from util import patches
from util.contract import ContractHelper
from util.ipfs import IPFSHelper
assert patches


def _ipfs_hashes_for_listings():
    """
    Returns an iterable with the IPFS hashes of all listings that exist on the
    blockchain.
    """
    contract_helper = ContractHelper()
    event_handler = EventHandler()
    hashes = set()

    def callback(payload):
        address = event_handler._get_new_listing_address(payload)
        data = event_handler._fetch_listing_data(address)
        hashes.add(data['ipfs_hash'])

    # TODO(cuongdo): extract 'NewListing(uint256)' into a variable, to avoid
    # so much repetition.
    contract_helper.fetch_events(["NewListing(uint256)"], callback)
    return hashes


def _scan_listings(dry_run):
    """
    Pins IPFS hashes with an associated listing and unpins hashes without one.
    """
    logging.info("started")

    ipfs_helper = IPFSHelper()
    pinned_ipfs_hashes = set(ipfs_helper.directly_pinned_hashes())
    logging.info("currently pinned hashes: %s", pinned_ipfs_hashes)
    listing_ipfs_hashes = _ipfs_hashes_for_listings()

    hashes_to_pin = listing_ipfs_hashes - pinned_ipfs_hashes
    hashes_to_unpin = pinned_ipfs_hashes - listing_ipfs_hashes

    # pin content that belongs to a listing and isn't already hashed
    logging.info("hashes to pin: %s", hashes_to_pin)
    if hashes_to_pin and not dry_run:
        pinned_hashes = set(ipfs_helper.pin_hashes(*hashes_to_pin)['Pins'])
        failed_hashes = pinned_hashes - hashes_to_pin
        if failed_hashes:
            logging.warning("failed to pin hashes %s", failed_hashes)

    # unpin content that doesn't belong to a listing
    #
    # TODO(cuongdo): Add a grace period for unpinning, so that we don't
    # potentially unpin content that's associated with new listings. Note that
    # unpinning allows GC to *potentially* happen. Once that happens, it's a race
    # between the IPFS GC and the next run of this tool.
    logging.info("hashes to unpin: %s", hashes_to_unpin)
    if hashes_to_unpin and not dry_run:
        unpinned_hashes = set(
            ipfs_helper.unpin_hashes(
                *hashes_to_unpin)['Pins'])
        failed_hashes = unpinned_hashes - hashes_to_unpin
        if failed_hashes:
            logging.warning("failed to unpin hashes %s", failed_hashes)

    logging.info("finished")


if __name__ == '__main__':
    db_utils.request_context().push()
    parser = argparse.ArgumentParser(
        description="Pins content in the IPFS gateway if it's associated with " +
        "an Origin listing and unpins it if there's no associated listing.")
    parser.add_argument('--dry-run', action='store_true',
                        help="output changes but do not execute them")
    args = parser.parse_args()
    _scan_listings(args.dry_run)
