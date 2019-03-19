![origin_github_banner](https://user-images.githubusercontent.com/673455/37314301-f8db9a90-2618-11e8-8fee-b44f38febf38.png)

![origin_npm_version](https://img.shields.io/npm/v/origin.svg?style=flat-square&colorA=111d28&colorB=1a82ff)
[![origin_license](https://img.shields.io/badge/license-MIT-6e3bea.svg?style=flat-square&colorA=111d28)](https://github.com/OriginProtocol/origin/blob/master/origin-js/LICENSE)
[![origin_travis_banner](https://img.shields.io/travis/OriginProtocol/origin/master.svg?style=flat-square&colorA=111d28)](https://travis-ci.org/OriginProtocol/origin/branches)

Origin is empowering developers to build decentralized marketplaces on the blockchain!

Visit our [Developer's page](https://www.originprotocol.com/developers) to learn more about what we're building and how to get involved.

You can see the Origin ecosystem in action at https://dapp.originprotocol.com.

## Development

Ready to get started? Have a look at our [developer quickstart](DEVELOPMENT.md) and our [contributing guidelines](CONTRIBUTING.md).

## This repository

This repository is a monorepo containing many npm packages.

### Core packages

These packages are used to build DApps on Origin.

| Package | Description |
|---------|-------------|
| [`@origin/contracts`](/packages/contracts) | Smart contracts|
| [`@origin/eventsource`](/packages/eventsource) | Derives current state of listings and offers from contract events |
| [`@origin/graphql`](/packages/graphql) | |
| [`@origin/ipfs`](/packages/ipfs) | Convenience methods for getting and setting data in IPFS |
| [`@origin/linker-client`](/packages/linker-client) | Client for mobile linking |
| [`@origin/messaging-client`](/packages/messaging-client) | Client for Origin messaging|
| [`@origin/origin-js`](/packages/origin-js) | (DEPRECATED) Library for interacting with smart contracts |
| [`@origin/services`](/packages/services) | Utility package for running Ganache and IPFS |
| [`@origin/token`](/packages/token) | Package for manipulating Origin Tokens (OGN)|
| [`@origin/validator`](/packages/validator) | JSON Schema validation |

### DApp packages

Example DApps that we have built.

| Package | Description |
|---------|-------------|
| [`@origin/admin`](/dapps/contracts) | DApp similar to `@origin/marketplace` but exposes more functionality |
| [`@origin/graphql-simple-demo`](/dapps/eventsource) | Example of building a DApp with `@origin/graphql` |
| [`@origin/marketplace`](/dapps/graphql) | Our marketplace DApp |

### Infrastructure packages

Servers and packages that provide extra functionality to DApps (e.g. search or attestations).

| Package | Description |
|---------|-------------|
| [`@origin/bridge`](/infra/bridge) | Server providing attestation services |
| [`@origin/cron`](/infra/cron) | Runs background tasks |
| [`@origin/dapp-creator-client`](/infra/dapp-creator-client) | Client that generates configs for `@origin/marketplace` |
| [`@origin/dapp-creator-server`](/infra/dapp-creator-server) | Server that generates configs for `@origin/marketplace` |
| [`@origin/discovery`](/infra/discovery) | Provides search features to `@origin/marketplace` |
| [`@origin/faucet`](/infra/faucet) | Token faucet |
| [`@origin/growth`](/infra/growth) | Growth engine |
| [`@origin/identity`](/infra/identity) | Database models for storing identity |
| [`@origin/ipfs-proxy`](/infra/ipfs-proxy) | Layer between IPFS and clients to prevent malicious use |
| [`@origin/linking`](/infra/linking) | Linking server for mobile integration|
| [`@origin/messaging`](/infra/messaging) | Messaging server |
| [`@origin/notifications`](/infra/notifications) | Delivers in browser notifications |
| [`@origin/tests`](/infra/tests) | Runs integration tests in Docker Compose |
| [`@origin/token-transfer-client`](/infra/token-transfer-client) | Client for delivering tokens |
| [`@origin/token-transfer-server`](/infra/token-transfer-server) | Server for delivering tokens |


### Mobile

| Package | Description |
|---------|-------------|
| [`@origin/mobile`](/mobile) | Mobile application |


## Contributing

Origin is an 100% open-source and community-driven project and we welcome contributions of all sorts. There are many ways to help, from reporting issues, contributing code, and helping us improve our community.

To get involved, please review our [guide to contributing](https://www.originprotocol.com/developers).
