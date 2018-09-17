#!/bin/bash

if [ "$1" != "dev" ] && [ "$1" != "staging" ] && [ "$1" != "prod" ]; then
    echo -e "\033[31mArgument must be one of dev, staging or prod\033[0m"
    exit
fi

if [ ! -f values/secret.yaml ]; then
    echo -e "\033[31mNo secrets file found at values/secret.yaml\033[0m"
    echo -e ""
    echo -e "It must be populated with the following configuration items:"
    echo -e "\t bridgeEnvKey - EnvKey key for use with origin-bridge"
    echo -e "\t gethAccountPrivateKey - Private key for account on Origin Ethereum network"
    echo -e "\t gethAccountSecret - Secret for account on Origin Ethereum network"
    exit
fi

helm upgrade $1 \
	chart \
	-i \
	-f chart/values.yaml \
	-f values/$1.yaml \
	-f values/secret.yaml \
	--namespace $1
