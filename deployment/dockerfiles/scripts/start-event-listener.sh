#!/bin/bash

# Starts the event-listener

set -e

eval $(envkey-source)

echo "Running database migrations for discovery"

# Run database migrations
node node_modules/.bin/sequelize db:migrate

echo "Starting event listener"

# Start event listener
node src/listener/listener.js
