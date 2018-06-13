# Origin Box

Origin Box is a container setup for running multiple Origin components simultaneously in a single environment.

## Use Cases

Origin Box has several intended use cases:
- Demonstration: We want to make it as easy as possible for people to spin up their own Origin environment, emphasizing that this platform is truly open and decentralized.
- Development: While we do our best to keep our components as independent as possible, ultimately they are all designed to function together as one unit. For development we do try to stub external components as much as possible, but this has its practical limits. It is often beneficial to be able to do development in an environment where all of the components are running. It can be tricky to get all of the various components synchronized on your local machine. Origin Box manages this complexity.
- End-to-end Testing: Currently we do not have any automated end-to-end tests. We rely heavily on manual testing. Having one environment where all of our components are running together will hopefully make it easier for us to set up end-to-end testing when we are ready to do that.

## Supported Components

Origin Box currently supports the following components:
- [Dapp](https://github.com/OriginProtocol/demo-dapp)
- [JS](https://github.com/OriginProtocol/origin-js)
- [Bridge](https://github.com/OriginProtocol/bridge-server)

## System Requirements

- Docker **version 18 or greater**
`docker --version`
- Git
git --version
- Unix-based system (OSX or Linux) - needed to run the bash scripts

## Usage

1. Run the setup script (from origin-box root directory):
`./scripts/setup-bridge.sh`

1. Run the start script: `./scripts/start-bridge.sh`

4. Access the CLI:
`./scripts/bash-bridge.sh`
