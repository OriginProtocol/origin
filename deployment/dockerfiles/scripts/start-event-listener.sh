#!/bin/bash

# Starts the event-listener

set -e

echo "Running database migrations for discovery"

# Run database migrations
node node_modules/.bin/sequelize db:migrate

echo "Starting event listener"

echo "{ \"lastLogBlock\": ${BLOCK_EPOCH} }" > ./continue.json

# Start event listener
node listener/listener.js \
	--elasticsearch \
	--db \
	--web3-url=${WEB3_URL} \
	--ipfs-url=${IPFS_URL} \
	--continue-file=./continue.json \
	--trail-behind-blocks=1
