![origin_github_banner](https://user-images.githubusercontent.com/673455/37314301-f8db9a90-2618-11e8-8fee-b44f38febf38.png)

Head to https://www.originprotocol.com/developers to learn more about what we're building and how to get involved.

# Development

To get started quickly, you can run a "light" version of the Origin DApp, which automatically sets up our DApp, a local IPFS server, and a local blockchain. 

Or you can use a more full featured development environment with Docker Compose orchestrating several containers and providing access to the full suite of the Origin DApp features, include messaging, browser notifications, and attestation services.

## Quick start - Running a local DApp

1. Check out the repository from GitHub and make sure you have installed all the necessary dependencies:

```
git clone https://github.com/OriginProtocol/origin
cd origin && npm install
```

2. You can then start the DApp using:

```
cd dapp && npm start
```

This will start a `webpack-dev-server` with hot reloading on `http://localhost:3000.`. When you open it you should see the message `No marketplace contract?`.

3. Deploy contracts (optional)

By default the DApp will start its own Ethereum blockchain using Ganache. Because it is a fresh network you'll need to deploy some contracts and create some sample listings using the `admin` tool. This can be done by running:

```
cd admin && npm start
```

Then open your browser to `http://localhost:3001` and:

- Select the Settings page (last icon on the right)
- Click the green `Populate` button.
- Copy and pasting the commands at the bottom of the page into the console for `dapp`.

### Network selection

You can also change the Ethereum network being used by the `marketplace` DApp by appending a network name to the URL.

- http://localhost:3000/docker - Local Ganache and services run by Docker Compose (see below for further instructions)

- http://localhost:3000/origin - Origin testnet backed by origin dev services (e.g. https://dapp.dev.originprotocol.com)
- http://localhost:3000/rinkeby - Ethereum Rinkeby backed by Origin staging services (e.g. https://dapp.staging.originprotocol.com)
- http://localhost:3000/mainnet - Ethereum Mainnet backed by Origin production services (e.g. https://dapp.originprotocol.com)

### Configuring Origin's Ethereum Testnet

- Open MetaMask by clicking on the extension.
- Open MetaMask's settings by clicking on the account icon in the top right and selecting `Settings` from the menu.
- Under `Net Network` enter `https://testnet.originprotocol.com/rpc` for the RPC URL.
- Select the Origin Testnet from the network selection in MetaMask.
- To receive Ethereum to transact on this network visit our faucet at `https://faucet.dev.originprotocol/eth?code=decentralize` and enter your wallet address.

You can view the state of the network at https://testnet.originprotocol.com/.

### Other settings

The marketplace DApp includes a settings page at `http://localhost:3000/settings` which is useful if you want to switch individual services, e.g. use a different Web3 provider or atteestation server.

### About the Origin repository

Origin uses a monorepo setup that is managed by `lerna`. The `--hoist` flag of `lerna` is used to pull common dependencies to the root of the monorepo on installation.

## Running Docker Compose

There is a Docker Compose configuration available for running a variety of backend services the DApp integrates with. The `docker-compose` configuration runs the following packages:

```
- elasticsearch on http://localhost:9200
- postgresql
- services (ipfs server and Ethereum blockchain using ganache on http://localhost:8545)
- bridge on http://localhost:5000
- discovery
- marketplace on http://localhost:3000
- event-listener
- discovery (apollo server on http://localhost:4000)
- growth (apollo server on http://localhost:4001)
- ipfs-proxy on http://localhost:9999
- messaging on http://localhost:9012
- notifications on http://localhost:3456)
```

⚠️  If you want to run the Docker Compose setup ensure that both `dapp` and `@origin/admin` are not running before you start the services. The required ports will not be available if either of those two are started before running `docker-compose up`.

### System Requirements

- [Docker](https://docs.docker.com/install/overview/) **version 18 or greater**:
`docker --version`
- [Docker Compose](https://docs.docker.com/compose/) **For Mac and Windows docker-compose should be part of desktop Docker installs**:
`docker-compose --version`
- [Git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git):
`git --version`
- Unix-based system (OSX or Linux) needed to run the bash scripts

### Getting Started with Docker Compose

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


### Modifying settings

Origin packages are configured using environment variables. The `docker-compose.yml` file has an environment section for each package where you can configure settings.

### Usage and commands

Please refer to the [docker-compose](https://docs.docker.com/compose/reference/overview/) documentation for usage. Some commands that may be useful are included below.

Start and stop the environment:
```
	docker-compose up
	docker-compose stop
```

⚠️ When docker builds an image part of the build process is `npm install` meaning that dependent packages from `package.json` are built into the image. This image is immutable. With `docker-compose up` a container is created where image gets a volume where any changes are stored. Running `docker-compose down` will remove that volume and any changes to the container after the image build will be lost.

Spawn a shell (command line) in a container:

	docker exec -ti <container_name> /bin/bash
	docker exec -ti dapp /bin/bash

Follow log output for all containers:

	docker-compose logs -f

Restart a container. In a new terminal window:

	docker-compose restart <container_name>

Rebuild containers (takes some time), in case you update dependencies (including npm). In a new terminal window:

	docker-compose build --no-cache origin

### Suggested workflow

Switching between branches or developing on a fresh branch can cause the dependencies in one of the `package.json` files to change. The host `node_modules` directories are not mounted inside the Docker container. For that reason installing dependencies needs to be done inside the containers. One solution is to rebuild the image with `docker-compose build` but that can be time consuming. To install new dependencies get a shell in the container and run `npm install`.

```
host-machine$ docker exec -ti <container_name> /bin/bash
docker-container$ npm run bootstrap # run inside /app directory
# close connection
host-machine$ docker-compose restart <container_name>
```

⚠️ Don't run `docker-compose down` when stopping containers! Any changes made since the initial Docker build will be lost. Instead use `docker-compose stop`

### Troubleshooting

#### Docker Desktop Mac

Running `docker down/up` and rebuilding image `docker-compose build` will consume disk space that docker might have problems releasing. One indication of this is that containers are unable to start. Check available disk space in `Disk` tab under Docker Desktop preferences. To free disk space:

```
$docker system prune --volumes --all
```

When doing a hard delete of Docker data Origin images need to be rebuilt `docker-compose build`

#### Elasticsearch fails to start with virtual memory error

The development stack includes an Elasticsearch container which may require an increase in the mmap counts for your OS. On Linux this can be achieved by running:

	sysctl -w vm.max_map_count=262144

For more information, see this [link.](https://www.elastic.co/guide/en/elasticsearch/reference/current/vm-max-map-count.html)

#### Docker Container exited with code 137

If a container is failing with code 137 it could be that it has encountered Out Of Memory error. To fix this dedicate more memory to Docker [see this link](https://www.petefreitag.com/item/848.cfm).

#### Port errors

The environment requires a number of ports to be free on your machine (3000, 5000, 5002, 8080, 8081 and 8545). If one of these ports isn't available spinning up the development environment may fail. This includes `@origin/dapp` and `@origin/admin`. Ensure you start those after you run `docker-compose up`.

#### Metamask errors

Sometimes Metamask gets confused on private networks. If you see errors generated by Metamask in your console while developing then clicking `Settings`→`Reset Account` in Metamask should resolve the issue.
