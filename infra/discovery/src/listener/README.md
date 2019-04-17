# Origin Event Listener

The Origin Event Listener follows the blockchain, spotting origin.js events and passing those on to whatever systems need that data. These events are annotated with the full information about the origin resources (listings/offers) that fired off these events.

The data from the listener can be used to build and keep up-to-date an offline index of all Origin Protocol data on the chain.

The listener will let you know one or more times about an event. Make sure your webhook endpoint is idempotent, and can handle receiving the same data multiple times!

To allow the listener to be compatible with [infura.io](https://infura.io/), it does not use subscriptions, only API queries.

# Running

You can either start the listener via docker compose or via lerna.

## Docker compose

    docker-compose up event-listener

## Lerna
### Prerequisite
 - Setup Postgres locally.
 - Create DB schema:
```
lerna run migrate --scope origin-discovery
lerna run migrate --scope origin-growth
lerna run migrate --scope origin-identity
```

### Start the listener
```
export DATABASE_URL=postgres://origin:origin@localhost/origin
export ELASTICSEARCH=localhost:9200
export LOG_LEVEL=DEBUG
export NETWORK=localhost
lerna run start:listener:development --scope origin-discovery --stream
```

# Command line options
 - `--verbose` Output json for all event information to stdout.
 - `--webhook=<URL>` Post json for each event to the URL. E.g. `http://localhost:3456/events`
 - `--discord-webhook=<discord URL>` Post a short Discord notification for each marketplace event.
 - `--email-webhook=<Email URL>` For internal use only.
 - `--elasticsearch` Experimental support for recording listings directly into elastic search.
 - `--marketplace` Index marketplace data.
 - `--identity` Index identity data.
 - `--growth` Index growth data.
 - `--continue-file=path` Will start following events at the block number defined in the file, and will keep this file updated as it listens to events. The continue file is JSON, in the format `{"lastLogBlock":222, "version":1}`.
 - `--concurrency` Warning: only use concurrency > 1 for backfills. Not under normal operation.
 - `--network` Possible values: origin, rinkeby, mainnet, ..

# Env variables

The listener uses `@origin/graphql` to load data.
  - NETWORK: the network to use, e.g. docker, localhost, rinkeby or mainnet
  - LOG_LEVEL: Logging level (debug, info, warn, error).

# How the listener works

The listener checks every few seconds for new events. If it sees new events it runs an event handler which takes some action based on the type of event.

## Error handling

- If there is an error loading information about an Origin object, then the listener will skip that event and continue to the next. Because of the design of the Origin Protocol, there is zero guarantees that the associated IPFS data for a resource will be valid, or even there at all. Anyone can put whatever they want there.

- When an error is raised when outputting to specific output handler (webhook, db, etc), the listener will attempt retries with increasing delays, up to two minutes. These retries will block all further event processing until the event goes through. If a maximum number of retries on one event has failed, then listener will quit, allowing it to be restarted from outside.

- When an error is raised when getting event or block number information, the same retry strategy as for output errors is tried (increasing delays).

# Indexing Mainnet data

This can be useful to validate code changes against production data or to reproduce a production issue.

### Run required services using docker-compose

`docker-compose up postgres elasticsearch discovery`

### Configure and start the listener
```
export INDEX_MARKETPLACE=true
export INDEX_IDENTITY=true
export INDEX_GROWTH=true
export DATABASE_URL=postgres://origin:origin@localhost/origin
export ELASTICSEARCH=true
export ELASTICSEARCH_HOST=localhost:9200
export LOG_LEVEL=DEBUG
export NETWORK=mainnet

lerna run start:listener:development --scope origin-discovery --stream
```

### Set the discovery server used by the DApp

Open `https://dapp.originprotocol.com/#/settings` and change the discovery server to `https://localhost:4000/graphql`.
