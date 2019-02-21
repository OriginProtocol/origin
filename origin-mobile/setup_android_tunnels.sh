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

ports_to_forward=(8081 8545 3008 8080 5002 3000 9999 4000 9012)

for port in ${ports_to_forward[*]}
do
    echo "Creating tunnel for TCP port $port"
    adb reverse tcp:$port tcp:$port
done
