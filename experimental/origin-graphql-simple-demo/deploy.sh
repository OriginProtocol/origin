#!/bin/sh

# NOTE: This script requires `ipfs daemon` to be running locally

if ! curl --silent --output /dev/null localhost:5001
  then echo "\nPlease start a local IPFS daemon first: https://ipfs.io/docs/install/\n" ; exit ; fi

# First run webpack
npm run build

# Add build directory to local ipfs. Extract directory hash from last line
HASH=$(ipfs add -r public | tail -n 1 | cut -d ' ' -f 2)

echo "\nPushing to https://ipfs.originprotocol.com/ipfs/${HASH}"

# Pin directory hash and children to Origin IPFS server
echo "https://ipfs.originprotocol.com/api/v0/pin/add?arg=$HASH" | xargs curl --silent --output /dev/null

# Fetch the hash back again
echo "https://ipfs.originprotocol.com/ipfs/$HASH" | xargs curl --silent --output /dev/null

echo "\nDeployed to https://ipfs.originprotocol.com/ipfs/$HASH\n"
