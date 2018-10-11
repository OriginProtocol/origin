![origin_github_banner](https://user-images.githubusercontent.com/673455/37314301-f8db9a90-2618-11e8-8fee-b44f38febf38.png)

This directory contains the deployment infrastructure for Origin. 

## Environments

The environments are running on a Kubernetes cluster using separate namespaces. The deployment is managed by a [Helm](https://www.helm.sh/) chart. Each service is a separate Docker container. The Docker containers are built and pushed to a container registry (currently [Google Cloud Container Registry](https://cloud.google.com/container-registry/)).

### Development (In progress)

| Service | Address | Notes | State |
| ------- | -------- | ----- | ----- |
| DApp | demo.dev.originprotocol.com | **Needs `origin-js` contract addresses** | Running |
| IPFS | ipfs.dev.originprotocol.com | Directed to IPFS API or gateway based on path | Running |
| Messaging | messaging.dev.originprotocol.com | Exposes websocket at `/` | Running |
| Bridge | bridge.dev.originprotocol.com | | Running |
| Eth Node | eth.dev.originprotocol.com | Private node using `geth`. One transaction ndoe and one mining node. RPC exposed at `/rpc` and WS exposed at `/ws`. Ethstats available at `/`. | Running |
| Discovery | discovery.dev.originprotocol.com | |
| Faucet | faucet.dev.originprotocol.com | Running |
| Postgresql | origin-214503:us-west1:dev | Google Cloud provisioned, 9.6 | Running |
| Elasticsearch | | Running |
 
### Staging (In progress)

| Service | Address | Notes | State |
| ------- | -------- | ----- | ----- |
| DApp | demo.staging.originprotocol.com | **Needs `origin-js` contract addresses** | Running |
| IPFS | ipfs.staging.originprotocol.com | Directed to IPFS API or gateway based on path | Running |
| Messaging | messaging.staging.originprotocol.com | Exposes websocket at `/` | Running |
| Bridge | bridge.staging.originprotocol.com | | Running |
| Eth Node | eth.staging.originprotocol.com | Rinkeby node. RPC exposed at `/rpc` and WS exposed at `/ws`. Ethstats available at `/`. | Running |
| Discovery | discovery.staging.originprotocol.com | |
| Faucet | faucet.staging.originprotocol.com | |
| Postgresql | origin-214503:us-west1:staging | Google Cloud provisioned, 9.6 | Running |
| Elasticsearch | | Running |

### Production (In progress)

The `.prod.` will be removed when the services are made live.

| Service | Address | Notes | State |
| ------- | -------- | ----- | ----- |
| DApp | demo.prod.originprotocol.com | | Running |
| IPFS | ipfs.prod.originprotocol.com | Directed to IPFS API or gateway based on path | Running |
| Messaging | messaging.prod.originprotocol.com | Exposes websocket at `/` | Running |
| Bridge | bridge.prod.originprotocol.com | | Running |
| Eth Node | eth.prod.originprotocol.com | Mainnet node. RPC exposed at `/rpc` and WS exposed at `/ws`. Ethstats available at `/`. | Running |
| Discovery | discovery.prod.originprotocol.com |  |
| Faucet | faucet.prod.originprotocol.com | |
| Postgresql | origin-214503:us-west1:prod | Google Cloud provisioned, 9.6 | Running |
| Elasticsearch | | Elastic Cloud provisioned | Running |
