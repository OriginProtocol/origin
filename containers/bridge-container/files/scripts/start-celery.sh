#!/bin/bash

cd $BRIDGE_SERVER_PATH
source $BRIDGE_SERVER_ENV_PATH/bin/activate
celery -A util.tasks worker -c=1 -E -B -l debug
