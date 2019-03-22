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
lerna run start:listener:development --scope origin-discovery --stream
```

# Command line options
 - `--verbose` Output json for all event information to stdout.
 - `--webhook=<URL>` Post json for each event to the URL.
 - `--discord-webhook=<discord URL>` Post a short Discord notification for each marketplace event.
 - `--email-webhook=<Email URL>` For internal use only.
 - `--elasticsearch` Experimental support for recording listings directly into elastic search.
 - `--marketplace` Index marketplace data.
 - `--identity` Index identity data.
 - `--growth` Index growth data.
 - `--continue-file=path` Will start following events at the block number defined in the file, and will keep this file updated as it listens to events. The continue file is JSON, in the format `{"lastLogBlock":222, "version":1}`.

# Env variables

The listener calls out origin.js to load and validate data from the blockchain. In order to properly configure an origin.js object, the listener uses the following environment variables:
  - ARBITRATOR_ACCOUNT: Ethereum address of the Origin marketplace arbitrator account.
  - AFFILIATE_ACCOUNT:  Ethereum address of the Origin marketplace affiliate account.
  - ATTESTATION_ACCOUNT: Ethereum address of the Origin attestation account.
  - BLOCK_EPOCH: Start block to use when scanning the blockchain for Origin events.
  - LOG_LEVEL: Logging level (debug, info, warn, error).

Those values can be found via the DApp info page:
  - Mainnet: https://dapp.originprotocol.com/#/dapp-info
  - Rinkeby: https://dapp.staging.originprotocol.com/#/dapp-info
  - Local blockchain: http://localhost:3000/#/dapp-info


# How the listener works

The listener checks every few seconds for a new block number. If it sees one, it requests all origin related events from the last block it saw an event on, to the new block.

For each of those events, the listener decodes them, annotates them with some useful fields, then runs a rule based on the event/contract to load additional information about the event through origin.js. For example, a `ListingCreated` event on a marketplace contract will have the results of `origin.marketplace.get` added to it. The code that uses the event listener output doesn't need to talk to the blockchain or IPFS at all.

After being annotated with more information, the event is then output to the places set by the command line options.

## Error handling

- If there is an error loading information about an origin.js object, then the listener will skip that event and continue to the next. Because of the design of the Origin Protocol, there is zero guarantees that the associated IPFS data for a resource will be valid, or even there at all. Anyone can put whatever they want there.

- When an error is raised when outputting to specific output handler (webhook, db, etc), the listener will attempt retries with increasing delays, up to two minutes. These retries will block all further event processing until the event goes through. If a maximum number of retries on one event has failed, then listener will quit, allowing it to be restarted from outside.

- When an error is raised when getting event or block number information, the same retry strategy as for output errors is tried (increasing delays).

# Indexing Mainnet data
This can be useful to validate code changes against production data or to reproduce a production issue.
It is recommended to use the lerna local setup rather than docker compose.

### Copy Mainnet contracts
```
rm origin-contracts/build/contracts/*
cp origin-contracts/releases/0.8.6/build/contracts/* origin-contracts/build/contracts
```

### Configure and start the listener
```
export WEB3_URL=https://mainnet.infura.io/v3/98df57f0748e455e871c48b96f2095b2
export BLOCK_EPOCH=6425000
export CONTINUE_BLOCK=6425000
export IPFS_URL=https://ipfs.originprotocol.com
export ARBITRATOR_ACCOUNT=0x64967e8cb62b0cd1bbed27bee4f0a6a2e454f06a
export AFFILIATE_ACCOUNT=0x7aD0fa0E2380a5e0208B25AC69216Bd7Ff206bF8
export ATTESTATION_ACCOUNT=0x8EAbA82d8D1046E4F242D4501aeBB1a6d4b5C4Aa
export DATABASE_URL=postgres://origin:origin@localhost/origin
export ELASTICSEARCH=true
export ELASTICSEARCH_HOST=localhost:9200
export INDEX_MARKETPLACE=true
export INDEX_IDENTITY=true
export INDEX_GROWTH=true
export LOG_LEVEL=INFO
lerna run start:listener:development --scope origin-discovery --stream
```

