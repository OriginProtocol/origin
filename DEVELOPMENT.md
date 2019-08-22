# ![origin_github_banner](https://user-images.githubusercontent.com/673455/37314301-f8db9a90-2618-11e8-8fee-b44f38febf38.png)

Head to [here](https://www.originprotocol.com/developers) to learn more about
what we're building and how to get involved.

## Development

To get started quickly, you have two options:
1. You can run a "light" version of the Origin DApp, which
automatically sets up our DApp, a local IPFS server, and a local blockchain. This is the simplest way to run the DApp but does not give you access to a full-fledge DApp: messaging, search, attestation services are not running. 
2. Or you can use a more full featured development environment with Docker Compose
orchestrating several containers and providing access to the full suite of the
Origin DApp features, including messaging, browser notifications, and
attestation services.

## Option 1: Quick start - Running a local DApp

1. Check out the repository from GitHub and make sure you have installed all the
   necessary dependencies:

```
git clone https://github.com/OriginProtocol/origin
cd origin && yarn
```

2. You can then start the marketplace DApp using:

```
yarn start
```

This will start a `webpack-dev-server` with hot reloading on
`http://localhost:3000.`. When you open it you should some sample listings.


## Option 2: Running Docker Compose

There is a Docker Compose configuration available for running a variety of
backend services the DApp integrates with. The `docker-compose` configuration
runs the following packages:

```
- elasticsearch on http://localhost:9200
- postgresql on port 5432
- redis on port 6379
- @origin/services: various back-end services
   - Ganache: Ethereum blockchain on http://localhost:8545
   - IPFS daemon on port 5002
   - @origin/ipfs-proxy: IPFS proxy on http://localhost:9999
- @origin/bridge: attestation server on http://localhost:5000
- @origin/discovery: discovery/search server on http://localhost:4000
- @origin/discovery: event-listener (aka "indexer")
- @origin/graphql: graphql server on http://localhost:4007
- @origin/growth: growth server on http://localhost:4008
- @origin/messaging: messaging server on http://localhost:9012
- @origin/notifications: email/mobile notification server on http://localhost:3456
```

⚠️ If you want to run the Docker Compose setup, ensure that both
`@origin/marketplace` and `@origin/admin` are not running before you start the
services. The required ports will not be available if either of those two are
started before running `docker-compose up`.

### System Requirements

- [Docker](https://docs.docker.com/install/overview/) **version 18 or greater**:
  `docker --version`
- [Docker Compose](https://docs.docker.com/compose/) **For Mac and Windows
  docker-compose should be part of desktop Docker installs**:
  `docker-compose --version`
- [Git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git):
  `git --version`
- Unix-based system (OSX or Linux) needed to run the bash scripts

### Getting Started with Docker Compose

⚠️ If you have previously used `docker-compose` with Origin, please ensure you
clear out old containers by stopping any running containers and executing
`docker system prune --volumes --all` before completing these steps.

1. Clone the repository:

`git clone https://github.com/OriginProtocol/origin` `cd origin`

2. Optional: Pick which version of the code you want to run. The latest code is
   on the *master* branch (which is checked out by default), while the code
   currently deployed in production is on the *stable* branch. For example, to use
   the stable branch, run:

```
git checkout --track origin/stable
```

3. From the root of the repository, run `docker-compose up`. The first time this
   command runs it will take some time to complete due to the initial building
   of the containers.
   
When the containers are running (it can take sme time), you can proceed to next step.
If you see an error in the logs please [raise an issue](https://github.com/OriginProtocol/origin/issues).

4. Start the marketplace DApp by running `yarn start`
This will start a `webpack-dev-server` with hot reloading and open the URL
`http://localhost:3000.` in your browser. You should some see the marketplace sample listings.
Note: If you get a blank page with a spinner for too long, try to refresh in your browser.

### Modifying settings

Origin packages are configured using environment variables. The
`docker-compose.yml` file has an environment section for each package where you
can configure settings.

### Usage and commands

Please refer to the
[docker-compose](https://docs.docker.com/compose/reference/overview/)
documentation for usage. Some commands that may be useful are included below.

Start and stop the environment:

```
    docker-compose up
    docker-compose stop
```

⚠️ When docker builds an image, part of the build process is `yarn install`,
meaning that dependent packages from `package.json` are built into the image.
This image is immutable. Running `docker-compose up` creates a container for the
image and a volume where any changes are stored. Running `docker-compose down`
will remove that volume, and any changes to the container after the image build
will be lost.

Spawn a shell (command line) in a container:

    docker exec -ti <container_name> /bin/bash
    docker exec -ti dapp /bin/bash

Follow log output for all containers:

    docker-compose logs -f

Restart a container. In a new terminal window:

    docker-compose restart <container_name>

Rebuild containers (takes some time), in case you update dependencies (including
npm). In a new terminal window:

    docker-compose build --no-cache services

### Suggested workflow

Switching between branches or developing on a fresh branch can cause the
dependencies in one of the `package.json` files to change. The host
`node_modules` directories are not mounted inside the Docker container. For that
reason, installing dependencies needs to be done inside the containers. One
solution is to rebuild the image with `docker-compose build`, which can be time
consuming. To install new dependencies, get a shell in the container and run
`npm install`.

```
host-machine$ docker exec -ti <container_name> /bin/bash
docker-container$ npm run bootstrap # run inside /app directory
# close connection
host-machine$ docker-compose restart <container_name>
```

⚠️ Don't run `docker-compose down` when stopping containers! Any changes made
since the initial Docker build will be lost. Instead use `docker-compose stop`.

### Troubleshooting

- If you get errors about missing npm packages, clean install of all modules -
  `cd` to root dir of repo - `lerna clean` (if needed, install lerna with
  `npm install -f lerna`) - `rm -rf node_modules` - `rm package-lock.json` (if
  it exists) - `bash scripts/clean-package-locks.sh` - `yarn install`

- If IPFS fails to start with error "UnhandledPromiseRejectionWarning: Error:
  Lock file is already being hold", clean up the IPFS local data:
  `rm -rf ~/.jsipfs/`

#### Docker

##### Disk Space

Running `docker down/up` and rebuilding image `docker-compose build` will
consume disk space that docker might have problems releasing. One indication of
this is that containers are unable to start. Check available disk space in
`Disk` tab under Docker Desktop preferences. To free disk space:

```
$docker system prune --volumes --all
```

When doing a hard delete of Docker data Origin, images need to be rebuilt
`docker-compose build`

##### Complete Docker Wipe

If you just want to completely start over with your docker environment:

    docker rm $(docker ps -aq) && docker image prune -a && docker-compose build && docker-compose up -d

#### Elasticsearch fails to start with virtual memory error

The development stack includes an Elasticsearch container that may require an
increase in the mmap counts for your OS. On Linux this can be achieved by
running:

    sysctl -w vm.max_map_count=262144

For more information, see this
[link.](https://www.elastic.co/guide/en/elasticsearch/reference/current/vm-max-map-count.html)

#### Docker Container exited with code 137

If a container is failing with code 137 it could be that it has encountered Out
Of Memory error. To fix this, dedicate more memory to Docker
[see this link](https://www.petefreitag.com/item/848.cfm).

#### Port errors

The environment requires a number of ports to be free on your machine (3000,
5000, 5002, 8080, 8081 and 8545). If one of these ports isn't available,
spinning up the development environment may fail. This includes `@origin/dapp`
and `@origin/admin`. Ensure you start those after you run `docker-compose up`.

## Metamask
In order to use the marketplace DApp, you need a web3 enable wallet. Metamask is a popular choice. It runs as a Chrome extension. You can install it by visiting [this URL](https://metamask.io/).

### Ethereum network
Within Metamask, you can select which Ethereum network to connect to.
For local development, pick "Localhost 8545". This will have metamask using your local ganache blockchain.

### Errors
Sometimes Metamask gets confused on private networks. If you see errors
generated by Metamask in your console while developing, clicking
`Settings`→`Reset Account` in Metamask should resolve the issue.

## Getting ETH for testing
Depending on which Ethereum network you use, here are ways to get ETH for testing:
 - On local ganache blockchain (aka localhost 8545)
    - In metamask, on the login page, click on "Import using account seed phrase" at the bottom
    - Then use the default ganache seed phase: "candy maple cake sugar pudding cream honey rich smooth crumble sweet treat"
    - Choose a password
    - In Metamask, your account should show as having an ETH balance of about 90 ETH or more.
- On Rinkeby
    - Visit the [Rinkeby faucet](https://faucet.rinkeby.io/)
 
## DApp settings

### Network selection

You can  change the Ethereum network being used by the marketplace DApp by
appending a network name to the URL.

- http://localhost:3000/ - Local Ganache and services 
- http://localhost:3000/origin - Origin testnet backed by origin dev services
  (e.g. https://dapp.dev.originprotocol.com)
- http://localhost:3000/rinkeby - Ethereum Rinkeby backed by Origin staging
  services (e.g. https://dapp.staging.originprotocol.com)
- http://localhost:3000/mainnet - Ethereum Mainnet backed by Origin production
  services (e.g. https://dapp.originprotocol.com)

### Using Origin's Ethereum Testnet
Origin runs a few nodes with its own test blockchain that can be used for testing.

Note: This is **not recommended for new developers**. Using the local ganache blockchain (aka localhost 8545) should be sufficient in most cases.

- Open MetaMask by clicking on the extension.
- Open MetaMask's settings by clicking on the account icon in the top right and
  selecting `Settings` from the menu.
- Under `Net Network` enter `https://testnet.originprotocol.com/rpc` for the RPC
  URL.
- Select the Origin Testnet from the network selection in MetaMask.
- To receive Ethereum to transact on this network, visit our faucet at
  `https://faucet.dev.originprotocol/eth?code=decentralize` and enter your
  wallet address.

You can view the state of the network at https://testnet.originprotocol.com/.

### Other settings

The marketplace DApp includes a settings page at
`http://localhost:3000/settings` that is useful if you want to switch individual
services, e.g. use a different Web3 provider or attestation server.

## About the Origin repository

Origin uses a monorepo setup that is managed by `lerna`. `yarn` is used for
package management so that we can leverage the workspaces feature to pull common
dependencies to the root of the monorepo on installation.

## Useful Commands

### Adding New Package Dependencies

Here's an example for adding the module `rot13` to the graphql pacakge:

  lerna add rot13 --scope=@origin/graphql
