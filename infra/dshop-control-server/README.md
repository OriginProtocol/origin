# DShop Control Server

Handles gathering of existing Shopify or DShop data and deployment of new DShops.

## Environment Variables

IPFS_ROOT_HASH - The root hash of a DShop JS and HTML directory (i.e. the build output from Webpack without any additional data)
IPFS_API_URL - URL of an IPFS API. It should allow uploads via /api/v0/add and linking functionality via /api/v0/object/patch/add-link and /api/v0/object/patch/rm-link.

## Deployment

Setup Heroku remotes

`heroku git:remote -a <backend_app> -r heroku-dshop-control-server`

Run `./deploy.sh` to push to Heroku
