![origin_github_banner](https://user-images.githubusercontent.com/673455/37314301-f8db9a90-2618-11e8-8fee-b44f38febf38.png)

# Consistency Checker

The consistency checker script verifies that corresponding database records have been created for events.  Currently supported events are:

- `IdentityUpdated`
- `ListingCreated`
- `OfferCreated`

Data is validated to varying degrees.

## CLI Arguments

### `--network=[networkName]`

The name of the network the script should check. (e.g. `docker`, `localhost`, `mainnet`, etc)

### `--ipfs-gateway=[ipfsGatewayURL]`

The IPFS gateway to pull IPFS data from

### `--from-block=[blockNumber]`

The start block to fetch events for.  Events before this block number will not be validated.

### `--identity`

Verify `IdentityUpdated` events and attestations.

### `--listings`

Verify `ListingCreated` events

### `--offers`

Verify `OfferCreated` events

## Environmental Variables

### `NETWORK`

Name of the network to check.  Synonymous with `--network`.

### `DATABASE_URL`

The URL for the DB to connect to and verify records.

### `JSONRPC_REQUEST_BATCH_SIZE`

The batch size of requests measured in blocks.  **NOTE**: web3.js beta-34 apparently dies if it returns more than 1000 results, so the default is set to `1000`.
