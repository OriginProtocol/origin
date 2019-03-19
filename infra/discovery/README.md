![origin_github_banner](https://user-images.githubusercontent.com/673455/37314301-f8db9a90-2618-11e8-8fee-b44f38febf38.png)

# Origin Discovery

This directory contains code for Origin discovery servers:

 - listener: Server that listens to events emitted by Origin contracts and indexes them.
 - apollo: GraphQL server for indexed data
 - lib: library for indexing data in various backend. Currently Postgres and Elasticsearch are supported.

## Discovery server
Refer to this [README](./src/apollo/README.md)

## Listener
Refer to this [README](./src/listener/README.md)

## Running tests

For linting run:

`lerna --scope origin-discovery run lint`

For unit tests run:

`lerna --scope origin-discovery run test`
