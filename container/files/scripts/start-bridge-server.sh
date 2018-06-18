#!/bin/bash

cd $BRIDGE_SERVER_PATH
source $BRIDGE_SERVER_ENV_PATH/bin/activate
main.py flask db migrate
python main.py
