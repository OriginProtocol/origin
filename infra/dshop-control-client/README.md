# Dshop Control Client

## Environment Variables

API_URL - URL of backend
IPFS_API_URL - URL of IPFS API capable of handling uploads via /api/v0/add
IPFS_GATEWAY_URL - URL of IPFS gateway

## Deployment

1. Set all the configuration values listed under `Environment Variables`.

2. `yarn run build`

3. Upload somewhere, e.g. IPFS

```sh
   export IPFS_DEPLOY_PINATA__API_KEY=<YOUR PINATA API KEY>
   export IPFS_DEPLOY_PINATA__SECRET_API_KEY=<YOUR PINATA SECRET KEY>
   npx ipfs-deploy -p pinata
```
