![origin_github_banner](https://user-images.githubusercontent.com/673455/37314301-f8db9a90-2618-11e8-8fee-b44f38febf38.png)

# Origin Discovery Servers

This directory contains code for Origin discovery servers:

 - listener: Server that listens to events emitted by Origin contracts and indexes them.
 - apollo: GraphQL server for indexed data
 - lib: library for indexing data in various backend. Currently Postgres and Elasticsearch are supported.

## To start the listener

Start the event-listener container.

    docker-compose up event-listener

You should see messages in the console indicating events are being indexed.

## To start the Apollo GraphQL server

Start the origin-discovery container.

    docker-compose up origin-discovery

The server should start and you can point your browser to http://localhost:4000/graphql to access the GraphQL playground.

## Running tests

For linting run:

`npm run lint`

For unit tests run:

`npm run test`
