#!/bin/bash

# Create symlink from origin-js contract ABIs to bridge server ABIs
ln -sfn /opt/origin-js/source/contracts/build/contracts /opt/origin-bridge/source/contracts_dev

# Run database migration scripts.
echo 'Running DB migration...'
cd $BRIDGE_SERVER_PATH
source $BRIDGE_SERVER_ENV_PATH/bin/activate
FLASK_APP=main.py flask db migrate

# Wait for local blockchain and local IPFS server, then start the bridge server.
echo 'Waiting for origin-js to be up...'
wait-for.sh -t 0 -q localhost:8545 -- wait-for.sh -t 0 -q localhost:8080 -- echo 'origin-js is available, starting origin-bridge...' && python main.py
