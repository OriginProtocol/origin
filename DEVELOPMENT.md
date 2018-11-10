![origin_github_banner](https://user-images.githubusercontent.com/673455/37314301-f8db9a90-2618-11e8-8fee-b44f38febf38.png)
[![origin_license](https://img.shields.io/badge/license-MIT-6e3bea.svg?style=flat-square&colorA=111d28)](https://github.com/OriginProtocol/origin/blob/master/origin-dapp/LICENSE)
[![origin_travis_banner](https://img.shields.io/travis/OriginProtocol/origin-dapp/master.svg?style=flat-square&colorA=111d28)](https://travis-ci.org/OriginProtocol/origin-dapp)

Head to https://www.originprotocol.com/developers to learn more about what we're building and how to get involved.

# Development

Origin has two development setups. One is the "light" version and consists of only our DApp and a local IPFS server and blockchain. It is intended to be easy to get started with but lacks some of the components of our stack making some of the DApp functionality unavailable.

The more full featured development environment uses Docker Compose to orchestrate several containers and provides access to the full suite of Origin feaetures, include messaging, browser notifications, and attestation services.

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
npm run dev
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

## Using Docker Compose

The Origin Docker Compose configuration runs the following packages simultaneously:

```
- ipfs-proxy
- origin-bridge
- origin-dapp
- origin-discovery (event-listener)
- origin-discovery (apollo server)
- origin-messaging
- origin-notifications
- origin-js (ipfs server)
- origin-js (ethereum blockchain using ganache)
- postgresql
- elasticsearch
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

1. Clone the repository:

`git clone https://github.com/OriginProtocol/origin`
`cd origin`

2. Optional: Pick which version of the code you want to run. The latest code is on the master branch (which is checked out by default), while the code currently deployed in production is on the stable branch. For example, to use the stable branch, run:
```
git checkout --track origin/stable
```

3. Run `./install.sh`.

When the install scripts completes type `docker-compose logs -f` to inspect the output of the containers and ensure everything is functional. You should then be able to access the DApp at `https://localhost:3000`.


### Usage and commands

Please refer to the [docker-compose](https://docs.docker.com/compose/reference/overview/) documentation for usage. Some commands that may be useful are included below.

Spawn a shell (command line) in a container:

	docker exec -ti <container_name> /bin/bash
	docker exec -ti origin-dapp /bin/bash
	docker exec -ti origin-js /bin/bash

Follow log output for all containers: 

	docker-compose logs -f

Restart a container. In a new terminal window:

	docker-compose restart <container_name>

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
