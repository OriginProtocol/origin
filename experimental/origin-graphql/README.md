# Origin GraphQL

This experimental package provides a GraphQL interface to Origin Protocol
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
