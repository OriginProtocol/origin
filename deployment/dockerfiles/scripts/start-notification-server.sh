#!/bin/bash

set -e

echo "Running database migrations for notification server"

# Run database migrations
node node_modules/.bin/sequelize db:migrate

echo "Starting notification server"

node app.js
