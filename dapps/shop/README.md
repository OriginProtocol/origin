# ![Origin Protocol](../marketplace/data/origin-header.png)

An experimental decentralized e-commerce store served entirely from IPFS.

## Setup

```sh
   # Clone and install
   git clone https://github.com/OriginProtocol/origin.git origin-store
   cd origin-store
   yarn
   cd dapps/shop

   # Copy example multi-product store data
   cp -r data/example data/mystore # Multi-product store
   # OR single-product store data
   cp -r data/example-single data/mystore # Single-product store

   # Copy PGP dist files
   cp -r ../../node_modules/openpgp/dist public

   # Edit config in data/mystore/config.json

   # Start local
   DATA_DIR=mystore yarn start
```

## Host on IPFS

First, sign up for [Pinata](https://pinata.cloud/signup)

```sh
   export IPFS_DEPLOY_PINATA__API_KEY=<YOUR PINATA API KEY>
   export IPFS_DEPLOY_PINATA__SECRET_API_KEY=<YOUR PINATA SECRET KEY>
   DATA_DIR=mystore yarn build
   cp -r data/mystore public
   npx ipfs-deploy -p pinata
```
