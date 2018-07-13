#!/bin/bash

cd $BRIDGE_SERVER_PATH
source $BRIDGE_SERVER_ENV_PATH/bin/activate

wait-for.sh -t 0 -q localhost:8545 -- wait-for.sh -t 0 -q localhost:8080 -- echo 'origin-js is available, starting origin-bridge celery...' && celery -A util.tasks worker -c=1 -E -B -l debug
