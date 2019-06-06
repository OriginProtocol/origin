# Origin GraphQL

This package provides a GraphQL interface to Origin Protocol
intended to be consumed by ApolloClient. It uses `apollo-link-schema` to
expose a client-side GraphQL server that can also be used server side.

This means a UI is able to leverage the power of GraphQL without depending on
a centralized server. The only server side dependencies are an Ethereum node and
and an IPFS server.

A GraphiQL demo is available [here](https://www.originadm.in/#/explorer)

## Key files

- `src/index.js` exposes an ApolloClient instance.
- `src/contracts.js` manages connections and subscriptions to an Ethereum node.
- `src/typeDefs` GraphQL type definitions.
- `src/resolvers` query resolvers.
- `src/mutations` mutation resolvers. Code for executing mutations.
- `src/utils/OriginEventSource` get the current state of listings or offers.
- `src/utils/eventCache` Caches events from an Ethereum node.

## Service Configuration Environmental Variables

- `NETWORK` - The Origin-defined network to connect to
- `USE_METRICS_PROVIDER` [`"true"`, `undefined`] - Configure and use the Web3 provider that displays general metrics about usage
- `APOLLO_METRICS_API_KEY` - API key to use for Apollo metrics.
- `DISABLE_CACHE` - Disable caching (currently only caching in the `eventsource` package)
- `PROVIDER_URL` - An explicit URL to use for a Web3 JSON-RPC provider
- `MAX_RPC_QPS` - The maximum JSON-RPC queries per second
- `MAX_RPC_CONCURRENT` - The maximum concurrent JSON-RPC queries
- `ECHO_EVERY` - Show basic JSON-RPC stats every `N` requests
- `BREAKDOWN_EVERY` - Show a JSON-RPC call breakdown every `N` requests
