#!/bin/bash

source $BRIDGE_SERVER_PATH/bridge-server-venv/bin/activate
celery -A util.tasks worker -c=1 -E -B -l debug