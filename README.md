# Important
This repository is no longer actively maintained and is in read-only mode.

## This repository

This repository is a monorepo containing many
[npm packages](https://www.npmjs.com/). It is managed using
[Lerna.](https://github.com/lerna/lerna)

### DApp packages

Example DApps that we have built.

| Package                                                     | Description                                                            |
| ----------------------------------------------------------- | ---------------------------------------------------------------------- |
| [`@origin/marketplace`](/dapps/marketplace)                 | Our marketplace DApp. [https://shoporigin.com](https://shoporigin.com) |
| [`@origin/admin`](/dapps/admin)                             | DApp similar to `@origin/marketplace` but exposes more functionality   |
| [`@origin/shop`](/dapps/shop)                               | Experimental decentralized e-commerce store                            |
| [`@origin/graphql-simple-demo`](/dapps/graphql-simple-demo) | Example of building a DApp with `@origin/graphql`                      |

### Core packages

These packages are used to build DApps on Origin.

| Package                                                  | Description                                                       |
| -------------------------------------------------------- | ----------------------------------------------------------------- |
| [`@origin/contracts`](/packages/contracts)               | Smart contracts                                                   |
| [`@origin/graphql`](/packages/graphql)                   | GraphQL interface to Origin Protocol                              |
| [`@origin/services`](/packages/services)                 | Utility package for running a local blockchain and IPFS           |
| [`@origin/eventsource`](/packages/eventsource)           | Derives current state of listings and offers from contract events |
| [`@origin/ipfs`](/packages/ipfs)                         | Convenience methods for getting and setting data in IPFS          |
| [`@origin/messaging-client`](/packages/messaging-client) | Client for Origin messaging                                       |
| [`@origin/token`](/packages/token)                       | Package for manipulating Origin Tokens (OGN)                      |
| [`@origin/validator`](/packages/validator)               | JSON Schema validation                                            |

### Infrastructure packages

Servers and packages that provide extra functionality to DApps (e.g. search or
attestations).

| Package                                                         | Description                                             |
| --------------------------------------------------------------- | ------------------------------------------------------- |
| [`@origin/bridge`](/infra/bridge)                               | Server providing attestation services                   |
| [`@origin/cron`](/infra/cron)                                   | Runs background tasks                                   |
| [`@origin/dapp-creator-client`](/infra/dapp-creator-client)     | Client that generates configs for `@origin/marketplace` |
| [`@origin/dapp-creator-server`](/infra/dapp-creator-server)     | Server that generates configs for `@origin/marketplace` |
| [`@origin/discovery`](/infra/discovery)                         | Provides search features to `@origin/marketplace`       |
| [`@origin/faucet`](/infra/faucet)                               | Token faucet                                            |
| [`@origin/growth`](/infra/growth)                               | Growth engine                                           |
| [`@origin/identity`](/infra/identity)                           | Database models for storing identity                    |
| [`@origin/ipfs-proxy`](/infra/ipfs-proxy)                       | Layer between IPFS and clients to prevent malicious use |
| [`@origin/messaging`](/infra/messaging)                         | Messaging server                                        |
| [`@origin/notifications`](/infra/notifications)                 | Delivers in browser notifications                       |
| [`@origin/relayer`](/infra/relayer)                             | Meta-txn relayer service                                |
| [`@origin/tests`](/infra/tests)                                 | Runs integration tests in Docker Compose                |
| [`@origin/token-transfer-client`](/infra/token-transfer-client) | Client for delivering tokens                            |
| [`@origin/token-transfer-server`](/infra/token-transfer-server) | Server for delivering tokens                            |

### Mobile

| Package                     | Description        |
| --------------------------- | ------------------ |
| [`@origin/mobile`](/mobile) | Mobile application |

The `@origin/mobile` package is not managed by `Lerna` due to issues with
`react-native` and hoisting.

## Contributing

Origin is an 100% open-source and community-driven project and we welcome
contributions of all sorts. There are many ways to help, from reporting issues,
contributing code, and helping us improve our community.

To get involved, please review our
[guide to contributing](https://www.originprotocol.com/developers).
