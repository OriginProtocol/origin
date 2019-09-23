# Origin Discovery

This directory contains code for Origin discovery servers:

- `src/listener`: Server that listens to events emitted by Origin contracts and indexes them.
- `src/apollo`: GraphQL server for indexed data
- `src/lib`: library for indexing data in various backend. Currently Postgres and Elasticsearch are supported.

## Discovery server

Refer to this [README](./src/apollo/README.md)

## Listener

Refer to this [README](./src/listener/README.md)

## Running tests

For linting run:

    lerna run lint --scope @origin/discovery

For unit tests run:

    lerna run test --scope @origin/discovery

## Local Development

Assuming you are starting from scratch, run the following from the root of the monorepo:

    docker-compose up postgres elasticsearch redis-master

    export DATABASE_URL=postgres://origin:origin@localhost/origin
    export ELASTICSEARCH_HOST=localhost:9200
    lerna run migrate --scope @origin/bridge
    lerna run migrate --scope @origin/discovery
    lerna run migrate --scope @origin/growth
    lerna run migrate --scope @origin/identity

    cd infra/discovery/
    node devops/es-cli.js createIndex listings
    npm run start:listener:development -- --network=localhost --verbose --marketplace --identity --elasticsearch
    npm run start:discovery:development -- --network=localhost --verbose --marketplace --identity --elasticsearch

To reset database:

    docker-compose down postgres && docker-compose up postgres

## Troubleshooting

### `elasticsearch` container fails with exit code 78

Run the following command to increase the value of `vm.max_map_count`

```
sudo sysctl -w vm.max_map_count=262144
```
