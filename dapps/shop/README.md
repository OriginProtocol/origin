# ![Origin Protocol](../marketplace/data/origin-header.png)

An experimental decentralized e-commerce store served entirely from IPFS.

## Create your store

First create a listing on shoporigin.com and make a note of the listing ID.

```sh
   # Clone and install
   git clone https://github.com/OriginProtocol/origin.git origin-store
   cd origin-store
   yarn
   cd dapps/shop

   # Copy example multi-product store data
   cp -r data/example data/mystore

   # OR single-product store data
   cp -r data/example-single data/mystore

   # Copy PGP dist files
   cp -r ../../node_modules/openpgp/dist public

   # Generate PGP keys. Make a note of public and private keys.
   node scripts/genKey

   # Edit config in data/mystore/config.json

   # By default, the back-end uses Sqlite. If you want to use Postgres, do the following:
   - Create a new dshop database. For example under psql:
   #> CREATE DATABASE dshop;
   - Set DATABASE_URL to point to your newly created DB. For example:
   export DATABASE_URL="postgres://origin:origin@localhost/dshop"
   - Create the DB schema by running the migrations
   cd backend
   yarn run migration

   # Optional: If you want to use the super-admin to create new shops, build the bundle.
   yarn run build:dist

   # Start local
   DATA_DIR=mystore yarn start

   # The following routes should be up:
     - Shop: http://0.0.0.0:9000/#
     - Admin: http://0.0.0.0:9000/#/admin
     - Super admin: http://0.0.0.0:9000/#/super-admin
```

## Troubleshooting
### Vips error
If you encounter this error on MacOS while running `yarn install`:
```
../src/common.cc:25:10: fatal error: 'vips/vips8' file not found
```
Try to install vips manually by running:
```brew install vips```

### js-ipfs error
If you encounter this error while using the admin to create a new shop:
```
UnhandledPromiseRejectionWarning: Error: Invalid version, must be a number equal to 1 or 0
    at Function.validateCID
```
Upgrade the ipfs package to 0.43.2 or higher under packages/origin/services/package.json

## Build

```sh
   PROVIDER=<provider> NETWORK=<mainnet|rinkeby> DATA_DIR=mystore npm run build
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

Make a note of the IPFS hash as you'll need it later...

## Setup domain via Cloudflare

1. Create a CNAME from `subdomain.yourdomain.com` to `cloudflare-ipfs.com`
2. Add a TXT record with the name `_dnslink.subdomain.yourdomain.com` and value
   `dnslink=/ipfs/<your_ipfs_hash_here>`
3. Visit
   [this page on Cloudflare](https://www.cloudflare.com/distributed-web-gateway/),
   scroll to the bottom and add your domain to the form
4. Ignore the 'Authentication Error' if there is one
5. Wait a minute or so, then visit your URL in a browser

## Setup ENS

1. Visit the [ENS App](https://app.ens.domains/)
2. Ensure your wallet (MetaMask et al) is pointing to Mainnet
3. Register your ENS domain
4. Use the Public resolver
5. Set content hash to `ipfs://<your_ipfs_hash_here>`
6. Wait a few minutes, then visit `https://your-ens-domain.eth.link`
