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

# Bundler
adb reverse tcp:8081 tcp:8081
# JSON-RPC
adb reverse tcp:8545 tcp:8545
# origin-linker
adb reverse tcp:3008 tcp:3008
# IPFS gateway
adb reverse tcp:8080 tcp:8080
# IPFS API
adb reverse tcp:5002 tcp:5002
# dapp, why?
adb reverse tcp:3000 tcp:3000
