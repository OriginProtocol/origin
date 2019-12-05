# ![Origin Protocol](../marketplace/data/origin-header.png)

An experimental decentralized e-commerce store served entirely from IPFS.

## Setup

```sh
   # Clone and install
   git clone https://github.com/OriginProtocol/origin.git origin-store
   cd origin-store
   yarn

   # Seed data
   cd dapps/shop
   mkdir data
   cd data
   curl https://gateway.pinata.cloud/ipfs/QmRhN3xGUQBG2DZPzqAT9fPPtptkD7VetNsiwKhaxJPnNv -o origin.zip
   unzip origin.zip
   rm origin.zip
   cd ..

   # Copy PGP dist files
   cp -r ../../node_modules/openpgp/dist public

   # Start local
   yarn start

```
