# origin-box: bridge

## Usage

- Activate the environment:

  `$ source /opt/origin-bridge/origin-bridge-venv/bin/activate`

## Configuration
- bridge server envionment variable file is located at `/opt/origin-bridge/.env` within the container
- database url: postgresql://docker:docker@localhost:5432/origin-bridge
- if running the origin-dapp locally alongside the container, use these settings for the environment variable (.env) file:
    - `BRIDGE_SERVER_PROTOCOL=http`
    - `BRIDGE_SERVER_DOMAIN=localhost:5000`
    - `IPFS_API_PORT=5002`
    - `IPFS_DOMAIN=localhost`
    - `IPFS_GATEWAY_PORT=8080`
    - `IPFS_GATEWAY_PROTOCOL=http`
    - `PROVIDER_URL=http://localhost:8545`


## TODOS
- envkey integration
- templating / user configurability / live updating of configs
- SDK, integration testing
