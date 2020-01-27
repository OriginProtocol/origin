# Dshop Control Client

## Environment Variables

API_URL - URL of backend
IPFS_API_URL - URL of IPFS API capable of handling uploads via /api/v0/add
IPFS_GATEWAY_URL - URL of IPFS gateway

## Deployment

Setup Heroku remotes

`heroku git:remote -a <frontend_app> -r heroku-dshop-control-client`

Run `./deploy.sh` to push to Heroku
