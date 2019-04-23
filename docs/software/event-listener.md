---
layout: page
title: Event Listener
nav_weight: 90
category: Software
---

# Origin Event Listener

The Origin Event Listener follows the blockchain, looking for Origin events and passing those events on to whatever systems need that data. These events are annotated with full information about the Origin resources (listings/offers/) that fired off these events.

The data from the listener can be used to build and keep up-to-date an offline index of all Origin Protocol data on the chain.

The listener will let you know one or more times about an event. Make sure your webhook endpoint is idempotent, and can handle receiving the same data multiple times!

To allow the listener to be compatible with [infura.io](https://infura.io/), the listener does not use subscriptions, only API queries.

## Running Localy


Start the event-listener container.

```bash
docker-compose up event-listener
```

You should see messages in the console indicating events are being indexed.



## Command line options

Output:

`--verbose` Optional. Output json for all event information to stdout.

`--notifications-webhook=yoururl` Optional. Post json for each event to the URL.

`--discord-webhook=discordurl` Optional. Post a short Discord notification for each marketplace event.

`--elasticsearch` Optional. Record data into Elasticsearch.

`--db` Optional. Record data into Postgres.

Config:
`--blockEpoch=blockNumber` Optional. Block number corresponding to Origin's plaform launch date.

`--defaultContinueBlock=blockNumber` Optional. Block number value to use if there is no continue data (ex. when listener is started for the first time).

`--continue-file=path` Optional. Will start following events at the block number defined in the file, and will keep this file updated as it listens to events. The continue file is JSON, in the format `{"lastLogBlock":222, "version":1}`. If no continue file is specified, the event listener stores the continue data in the Postgres DB.

`--trailBlocks=numBlocks` Optional. Number of confirmation blocks before data is indexed

`--web3Url=URL` Optional. Web3 provider. For example https://mainnet.infura.io/v2/<your key>

`--ipfsUrl=URL` Optional. IPFS cluster to use for fetching the off-chain data.

`--arbitratorAccount=ethereumAddress` Optional. Address of the Origin arbitrator account.

`--affiliateAccount=ethereumAddress` Optional. Address of the Origin affiliate account.

`--attestationAccount=ethereumAddress` Optional. Address of the Origin attestation account.


## Env variables

The listener calls out origin.js to load and validate data from the blockchain. In order to properly configure an origin.js object, the listener uses the following environment variables:
  - AFFILIATE_ACCOUNT:  Ethereum address of the Origin marketplace affilicate account.
  - ARBITRATOR_ACCOUNT: Ethereum address of the Origin marketplace arbitrator account.
  - ATTESTATION_ACCOUNT: Ethereum address of the Origin attestation account.
  - BLOCK_EPOCH: Start block to use when scanning the blockchain for Origin events.

Those values can be found via the DApp info page:
  - Mainnet: https://dapp.originprotocol.com/#/dapp-info
  - Rinkeby: https://dapp.staging.originprotocol.com/#/dapp-info
  - Local blockchain: http://localhost:3000/#/dapp-info


## How the listener works

The listener checks every few seconds for a new block number. If it sees one, it requests all Origin related events from the last block it saw an event on, to the new block.

For each of those events, the listener decodes them, annotates them with some useful fields, then runs a rule based on the event/contract to load additional information about the event through origin.js. For example, a `ListingCreated` event on a marketplace contract will have the results of `origin.marketplace.get` added to it. The code that uses the event listener output doesn't need to talk to the blockchain or IPFS at all.

After being annotated with more information, the event is then output to the places set by the command line options.

## Error handling

- If there is an error loading information about an origin.js object, then the listener will skip that event and continue to the next. Because of the design of the Origin Protocol, there is zero guarantees that the associated IPFS data for a resource will be valid, or even there at all. Anyone can put whatever they want there.

- When an error is raised when outputting to specific output handler (webhook, db, etc), the listener will attempt retries with increasing delays, up to two minutes. These retries will block all further event processing until the event goes through. If a maximum number of retries on one event has failed, then listener will quit, allowing it to be restarted from outside.

- When an error is raised when getting event or block number information, the same retry strategy as for output errors is tried (increasing delays).
