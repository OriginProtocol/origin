#!/bin/sh
#########
# Setup adb tunnels to connect local services for android testing
#
# Alternatively, you could setup .env to point the hostname of your dev machine
#########

if [[ $(adb devices | grep -v List | grep device | wc -l) -lt 1 ]]; then
    echo "No adb devices connected"
    exit 1
fi

ports_to_forward=(3000 3008 3456 4000 5000 5002 8081 8083 8545 9012 9999)

for port in ${ports_to_forward[*]}
do
    echo "Creating tunnel for TCP port $port"
    adb reverse tcp:$port tcp:$port
done
