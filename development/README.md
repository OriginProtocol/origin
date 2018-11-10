![origin_github_banner](https://user-images.githubusercontent.com/673455/37314301-f8db9a90-2618-11e8-8fee-b44f38febf38.png)

Head to https://www.originprotocol.com/developers to learn more about what we're building and how to get involved.

# Origin Box

Origin Box is a [Docker](https://www.docker.com/) container setup for running all core Origin components together in a single environment, preconfigured to work together.

Origin Box currently supports the following components:
- [origin-dapp](https://github.com/OriginProtocol/origin/tree/master/origin-dapp#origin-demo-dapp)
- [origin-website](https://github.com/OriginProtocol/origin-website)

Each repo is symlinked from the container to a local directory. You may edit the source code using your favorite editor. The repo directories are just normal git repositories, so you can treat them as you would any other git repository. You can make changes, commit them, and change branches — and the container will be automatically kept in sync.

Note that origin-box supports two separate development stacks: One is the standard Origin Protocol stack consisting of origin-js, origin-bridge, and origin-dapp repositories, and the other is the the Origin website (https://originprotocol.com) stack consisting of the origin-website repository.

## Use Cases

Origin Box has several intended use cases:

- Demonstration: We want to make it as easy as possible for people to spin up their own Origin environment, emphasizing that this platform is truly open and decentralized.
- Development: While we do our best to keep our components as independent as possible, ultimately they are all designed to function together as one unit. For development we do try to stub external components as much as possible, but this has its practical limits. It is often beneficial to be able to do development in an environment where all of the components are running. It can be tricky to get all of the various components synchronized on your local machine. Origin Box manages this complexity.
- End-to-end Testing: Currently we do not have any automated end-to-end tests. We rely heavily on manual testing. Having one environment where all of our components are running together will hopefully make it easier for us to set up end-to-end testing when we are ready to do that.

## System Requirements

- [Docker](https://docs.docker.com/install/overview/) **version 18 or greater**:
`docker --version`
- [Docker Compose](https://docs.docker.com/compose/) **For Mac and Windows docker-compose should be part of desktop Docker installs**:
`docker-compose --version`
- [Git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git):
`git --version`
- Unix-based system (OSX or Linux) needed to run the bash scripts

## Getting started

1. Clone the origin repository via SSH. If you haven't enabled SSH authentication on Github, [here's how to do it.](https://help.github.com/articles/about-ssh/).
```
git clone git@github.com:OriginProtocol/origin.git
cd origin
```

2. Optional: Pick which version of the code you want to run. The latest code is on the master branch (which is checked out by default), while the code currently deployed in production is on the stable branch. For example, to use the stable branch, run:
```
git checkout --track origin/stable
```

3. Run `./install.sh`.

If the install script doesn't complete the most likely reason is you don't have the [required ports](#port-errors) open.

## Configuration

Configuration files reside in the `envfiles` directory. They are mounted into the relevant docker container when it is started. Modifications to these files will require a container restart using `docker-compose down && docker-compose up` (if the container was running). The configuration should work out of the box. Certain components may require additional API keys for certain things to work. For example, origin-bridge needs some API keys for attestation services to work.

## Usage

Management of the containers is handled by [docker-compose](https://docs.docker.com/compose/).

To start the stack run:

```
docker-compose up
```

And to stop it:

```
docker-compose down
```

### Handy commands

Spawn a shell (command line) in a container:

	docker exec -ti <container_name> /bin/bash
	docker exec -ti origin-dapp /bin/bash
	docker exec -ti origin-js /bin/bash

Follow log output for all containers: 

	docker-compose logs -f

Restart a container. In a new terminal window:

	docker-compose restart <container_name>


### Package management

Packages are installed during the Docker build process. If you modify the packages for a project (i.e. anything that results in a change to package.json or requirements.txt) you may need to add any missing packages to the container. The best way to do this is to rebuild the container.

E.g. to rebuild the origin-js container:

	docker-compose build --no-cache origin-js

## Troubleshooting

### Elasticsearch fails to start with virtual memory error

The development stack includes an Elasticsearch container which may require an increase in the mmap counts for your OS. On Linux this can be achieved by running:

	sysctl -w vm.max_map_count=262144

For more information, see this [link.](https://www.elastic.co/guide/en/elasticsearch/reference/current/vm-max-map-count.html)

### Docker Container exited with code 137

If a container is failing with code 137 it could be that it has encountered Out Of Memory error. To fix this dedicate more memory to Docker [see this link](https://www.petefreitag.com/item/848.cfm).

### Port errors

The environment requires a number of ports to be free on your machine (3000, 5000, 5002, 8080, 8081 and 8545). If one of these ports isn't available spinning up the development environment may fail.

### Metamask errors

Sometimes Metamask gets confused on private networks. If you see errors generated by Metamask in your console while developing then clicking `Settings`→`Reset Account` in Metamask should resolve the issue.
