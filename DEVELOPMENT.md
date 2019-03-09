![origin_github_banner](https://user-images.githubusercontent.com/673455/37314301-f8db9a90-2618-11e8-8fee-b44f38febf38.png)

Head to https://www.originprotocol.com/developers to learn more about what we're building and how to get involved.

# Development

In most cases developers who are new to Origin will want to work on our marketplace DApp. The DApp has some required an optional backend services that it needs to run, for example an Ethereum network, or an attestation server. The default development setup allows you to develop with the DApp backed by services in our development deployment. You can also alternatively run your own set of local services using `docker-compose`.

## About the Origin repository

Origin uses a monorepo setup that is managed by `lerna`. The `--hoist` flag of `lerna` is used to pull common dependencies to the root of the monorepo on installation.

## Developing with the DApp

1. Check out the repository from GitHub and make sure you have installed all the necessary dependencies:

```
git clone https://github.com/OriginProtocol/origin
cd origin && npm install
```

2. You can then start the DApp using:

```
npm start
```

This will start a `webpack-dev-server` with hot reloading on `http://localhost:3000.`.

3. You will then need to connect to your testnet. Using MetaMask follow these steps:

- Open MetaMask by clicking on the extension.
- Open MetaMask's settings by clicking on the account icon in the top right and selecting `Settings` from the menu.
- Under `Net Network` enter `https://testnet.originprotocol.com/rpc` for the RPC URL.
- Select the Origin Testnet from the network selection in MetaMask.
- To receive Ethereum to transact on this network visit our faucet at `https://faucet.dev.originprotocol/eth` and use the invitation code `decentralize`.

### Network selection

By default the DApp will use a set of Origin's deployed development services. You can change the environment used by the DApp by accessing the following URLs:

- http://localhost:3000/docker - Local Ganache and services runn by Docker Compose (see below for further instructions)
- http://localhost:3000/rinkeby - Ethereum Rinkeby backed by Origin staging services (e.g. https://dapp.staging.originprotocol.com)
- http://localhost:3000/mainnet - Ethereum Mainnet backed by Origin production services (e.g. https://dapp.originprotocol.com)

### Other settings

The DApp includes a settings page at `http://localhost:3000/settings` which is useful if you want to switch individual services, e.g. use a different Web3 provider or atteestation server.

## Running Docker Compose

The `docker-compose` configuration runs the following packages:

```
- elasticsearch on http://localhost:9200
- postgresql
- origin-services (ipfs server)
- origin-services (ethereum blockchain using ganache on http://localhost:8545)
- origin-bridge on http://localhost:5000
- origin-discovery (event-listener)
- origin-discovery (apollo server on http://localhost:4000)
- origin-ipfs-proxy on http://localhost:9999
- origin-messaging on http://localhost:9012
- origin-notifications on http://localhost:3456)
```

### System Requirements

- [Docker](https://docs.docker.com/install/overview/) **version 18 or greater**:
`docker --version`
- [Docker Compose](https://docs.docker.com/compose/) **For Mac and Windows docker-compose should be part of desktop Docker installs**:
`docker-compose --version`
- [Git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git):
`git --version`
- Unix-based system (OSX or Linux) needed to run the bash scripts

### Getting Started

⚠️  If you have previously used  `docker-compose` with Origin, please ensure you clear out old containers by stopping any running containers and executing `docker system prune --volumes --all` before completing these steps.

1. Clone the repository:

`git clone https://github.com/OriginProtocol/origin`
`cd origin`

2. Optional: Pick which version of the code you want to run. The latest code is on the master branch (which is checked out by default), while the code currently deployed in production is on the stable branch. For example, to use the stable branch, run:
```
git checkout --track origin/stable
```

3. From the root of the repository run `docker-compose up`. The first time this command runs it will take some time to complete due to the initial building of the containers.

Please note this can take some time. If you see an error in the logs please [raise an issue](https://github.com/OriginProtocol/origin/issues). When the containers are running you can access the DApp at `http://localhost:3000`.

### Usage and commands

Please refer to the [docker-compose](https://docs.docker.com/compose/reference/overview/) documentation for usage. Some commands that may be useful are included below.

Start and stop the environment:

	docker-compose up
	docker-compose down

Spawn a shell (command line) in a container:

	docker exec -ti <container_name> /bin/bash
	docker exec -ti origin-dapp /bin/bash

Follow log output for all containers:

	docker-compose logs -f

Restart a container. In a new terminal window:

	docker-compose restart <container_name>

Rebuild containers (takes some time), in case you update dependencies (including npm). In a new terminal window:

	docker-compose build --no-cache origin

### Troubleshooting

#### Elasticsearch fails to start with virtual memory error

The development stack includes an Elasticsearch container which may require an increase in the mmap counts for your OS. On Linux this can be achieved by running:

	sysctl -w vm.max_map_count=262144

For more information, see this [link.](https://www.elastic.co/guide/en/elasticsearch/reference/current/vm-max-map-count.html)

#### Docker Container exited with code 137

If a container is failing with code 137 it could be that it has encountered Out Of Memory error. To fix this dedicate more memory to Docker [see this link](https://www.petefreitag.com/item/848.cfm).

#### Port errors

The environment requires a number of ports to be free on your machine (3000, 5000, 5002, 8080, 8081 and 8545). If one of these ports isn't available spinning up the development environment may fail.

#### Metamask errors

Sometimes Metamask gets confused on private networks. If you see errors generated by Metamask in your console while developing then clicking `Settings`→`Reset Account` in Metamask should resolve the issue.
