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
| Faucet | faucet.dev.originprotocol.com | |
| Postgresql | origin-214503:us-west1:dev | Google Cloud provisioned, 9.6 | Running |
| Elasticsearch |
 
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
| Elasticsearch |

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
| Elasticsearch | 051cd7e780424c669c760d3bf25f2a92.us-west1.gcp.cloud.es.io:9243 | Elastic Cloud provisioned | Running |

## Backups (Done)

All disks that underly the cluster that need to be persistent are snapshotted hourly using Google Cloud's snapshot service. The snapshots are differential so a long history can be retained without using too much space. Currently snapshots are retained for 14 days.

When a snapshot is removed the next oldest snapshot is adjusted to contain any data that was in the oldest snapshot. This is handled transparently by Google Cloud. More information is available [here.](https://cloud.google.com/compute/docs/disks/create-snapshots)

## SSL (Done)

_Although this is complete a few more days are needed for all SSL certificates to be available due to rate limiting._

SSL certificates are handled transparently by LetsEncrypt and with [cert-manager](https://github.com/jetstack/cert-manager) and [nginx-ingress](https://github.com/helm/charts/tree/master/stable/nginx-ingress). 

## CI/CD (Not started)

CI/CD configuration will be handled by Travis CI. On certain events the affected containers will be built and pushed to the container registry. The relevant development environment will then be updated via Kubernetes which will handle the rollout of the new container(s).

In a similar way contracts will be deployed to the development (ganache) and staging (rinkeby) networks. At this stage it is not known how the addresses of contracts will be handled.

| Environment | Trigger |
| ----------- | ------- |
| Development | Merge into `master` |
| Staging | Merge into `stable` |
| Production | Tag with `release-*` |

### Deployment dependencies

![Deployment Dependencies](https://raw.githubusercontent.com/OriginProtocol/origin-box/tomlinton/helm/deployment/dependencies.svg?sanitize=true)

### Discord integration

* Tests failed
* Tests passed
* Container deployed to environment (which container, which environment)

## Monitoring and alerting (Not started)

Initially this will be handled by the services available in Google Cloud.

* Uptime checks with notifications (phone, email, discord webhook)
* Dashboard for monitoring CPU, disk, memory
