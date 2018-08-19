#!/usr/bin/env bash

# Read the IPFS peer id from an IPFS configuration file and set the IPFS_SWARM
# variable in an envfile based on that peer id.
#
# This is used to set the IPFS_SWARM value for origin-dapp. It is not known
# until the orbit-db container starts because it generates a new peer id.

PEER_ID=$(awk -F '\"' ' /'PeerID'/ {print $4}' $1)
PREFIX='/ip4/127.0.0.1/tcp/9012/ws/ipfs/'

IPFS_SWARM="$PREFIX$PEER_ID"

sed -i "s|^IPFS_SWARM.*|IPFS_SWARM=$IPFS_SWARM|g" $2
