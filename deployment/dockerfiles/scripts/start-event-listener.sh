#!/bin/bash

# Starts the event-listener

set -e

eval $(envkey-source)

echo "Running database migrations for discovery"

# Run database migrations
node node_modules/.bin/sequelize db:migrate

echo "Starting event listener"

# Write the BLOCK_EPOCH to the continue file so we don't scan through blocks
# starting at 0
echo "{ \"lastLogBlock\": ${BLOCK_EPOCH} }" > ${CONTINUE_FILE}

# Start event listener
node listener/listener.js
