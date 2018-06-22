#!/bin/bash

# Create symlink from origin-js contract ABIs to bridge server ABIs
ln -sfn /opt/origin-js/source/contracts/build/contracts /opt/bridge-server/source/contracts_dev

cd $BRIDGE_SERVER_PATH
source $BRIDGE_SERVER_ENV_PATH/bin/activate
main.py flask db migrate
python main.py
