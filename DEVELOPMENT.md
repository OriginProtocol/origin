![origin_github_banner](https://user-images.githubusercontent.com/673455/37314301-f8db9a90-2618-11e8-8fee-b44f38febf38.png)

Head to https://www.originprotocol.com/developers to learn more about what we're building and how to get involved.

# Development

Origin has two development setups. One is the "light" version and consists of only our DApp and a local IPFS server and blockchain. It is intended to be easy to get started with but lacks some of the components of our stack making some of the DApp functionality unavailable.

The more full featured development environment uses Docker Compose to orchestrate several containers and provides access to the full suite of Origin features, include messaging, browser notifications, and attestation services.

## About the Origin repository

Origin uses a monorepo setup that is managed by `lerna`. The `--hoist` flag of `lerna` is used to pull common dependencies to the root of the monorepo on installation.

## Using NPM & Lerna

1. Check out the repository from GitHub and make sure you have installed all the necessary dependencies:

```
git clone https://github.com/OriginProtocol/origin
cd origin && npm install
```

2. Configure the DApp with default environment variables:

```
cp origin-dapp/dev.env origin-dapp/.env
```

3. You can then start a light development environment by executing:

```
npm start
```

4. You will then need to connect to your locally running blockchain in MetaMask. Follow these steps:

- Log out of MetaMask.

- Click `Restore from seed phrase`

- Enter the following seed phrase (Mnemonic):

```
candy maple cake sugar pudding cream honey rich smooth crumble sweet treat
```

This is the default seed phrase used by [Truffle](https://github.com/trufflesuite/truffle) for development.

 ⚠️  Be careful not to mix up your test wallet with your real one on the Main Network.

- Click where it says "Ethereum Main Network" and select "Localhost 8545". Click the back arrow to return to your account.

- You should see your first test account now has 100 ETH and the address `0x627306090abaB3A6e1400e9345bC60c78a8BEf57`. Additional generated accounts will also have this amount.

### Troubleshooting
 - If IPFS fails to start with error "UnhandledPromiseRejectionWarning: Error: Lock file is already being hold", clean up the IPFS local data:
```rm -rf ~/.jsipfs/```

## Using Docker Compose

The Origin Docker Compose configuration runs the following packages:

```
- origin-bridge on http://localhost:5000
- origin-dapp on http://localhost:3000 (ethereum blockchain using ganache on http://localhost:8545)
- origin-event-listener
- origin-discovery (apollo server on http://localhost:4000)
- origin-growth (apollo server on http://localhost:4001)
- origin-ipfs-proxy on http://localhost:9999
- origin-messaging on http://localhost:9012
- origin-notifications on http://localhost:3456)
- origin-ipfs-proxy (ipfs server http://localhost:9999)
- postgresql
- elasticsearch on http://localhost:9200
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
```
	docker-compose up
	docker-compose stop
```

⚠️ When docker builds an image part of the build process is `npm install` meaning that dependant node_modules are built into the image. This image is immutable. With `docker-compose up` a container is created where image gets a volume where any changes are stored. Running `docker-compose down` will remove that volume and any changes to the container after the image build will be lost.

Spawn a shell (command line) in a container:

	docker exec -ti <container_name> /bin/bash
	docker exec -ti origin-dapp /bin/bash

Follow log output for all containers:

	docker-compose logs -f

Restart a container. In a new terminal window:

	docker-compose restart <container_name>

Rebuild containers (takes some time), in case you update dependencies (including npm). In a new terminal window:

	docker-compose build --no-cache origin

Configure environment variables in `development/envfiles`

### Suggested workflow

Switching between branches or developing on a fresh one can cause the dependancies in one of the `package.lock` files to change. Dependancies in `node_modules` are not mapped to host machines and are present only inside docker containers. For that reason installing dependancies needs to be ran inside the containers. One solution is to rebuild the image with `docker-compose build` but that can be very time consuming. To install new dependancies ssh to the container that lacks them (usually indicated by an NPM error in docker logs) and run install

```
host-machine$ docker exec -ti <container_name> /bin/bash
docker-container$ npm run bootstrap # run inside /app directory
# close connection
host-machine$ docker-compose restart <container_name>
```

⚠️ Don't run `docker-compose down` when stopping containers! It will prune the container volumes and any changes after the initial image build shall be lost. Instead use `docker-compose stop`

### Troubleshooting

### Docker Desktop Mac

Running `docker down/up` and rebuilding image `docker-compose build` will consume disk space that docker might have problems releasing. One indication of this is that containers are unable to start. Check available disk space in `Disk` tab under Docker Desktop preferences. To free disk space:

```
$docker system prune
$docker volume prune
```

In some cases that might still not free up the disk space in that case do a hard delete of Docker data

```
# Stop Docker for Desktop process
$rm -rf ~/Library/Containers/com.docker.docker/Data/*  # delete Docker data 
# Start Docker for Desktop process
```

When doing a hard delete of Docker data origin images need to be rebuilt `docker-compose build`

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
