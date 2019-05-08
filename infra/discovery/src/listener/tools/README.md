![origin_github_banner](https://user-images.githubusercontent.com/673455/37314301-f8db9a90-2618-11e8-8fee-b44f38febf38.png)

# Discovery Tools

- [consistencyChekcer.js](#consistency-checker)
- [triggerOfferCreated.js](#trigger-offercreated)
- [triggerIdentityUpdated.js](#trigger-identityupdated)

---

## Consistency Checker

The consistency checker script verifies that corresponding database records have been created for events.  Currently supported events are:

- `IdentityUpdated`
- `ListingCreated`
- `OfferCreated`

Data is validated to varying degrees.

### CLI Arguments

#### `--network=[networkName]`

The name of the network the script should check. (e.g. `docker`, `localhost`, `mainnet`, etc)

#### `--ipfs-gateway=[ipfsGatewayURL]`

The IPFS gateway to pull IPFS data from

#### `--from-block=[blockNumber]`

The start block to fetch events for.  Events before this block number will not be validated.

#### `--identity`

Verify `IdentityUpdated` events and attestations.

#### `--listings`

Verify `ListingCreated` events

#### `--offers`

Verify `OfferCreated` events

### Environmental Variables

#### `NETWORK`

Name of the network to check.  Synonymous with `--network`.

#### `DATABASE_URL`

The URL for the DB to connect to and verify records.

#### `JSONRPC_REQUEST_BATCH_SIZE`

The batch size of requests measured in blocks.  **NOTE**: web3.js beta-34 apparently dies if it returns more than 1000 results, so the default is set to `1000`.

---

## Trigger OfferCreated

This script will create an offer by populating IPFS with offer JSON and creating a contract transaction for `makeOffer()`.

### Environmental Variables

#### `IPFS_GATEWAY`

The IPFS gateway base URL to use.  Default: `http://localhost:5002`

#### `LISTING_ID`

The integer listing ID to create an offer for.  Defaults to `1`

#### `ACCOUNT`

The account to use as sender when creating an offer.  Defaults to the first account/coinbase on the node.

#### `NETWORK`

The network configuration to use as configured by `@origin/graphql`.  Defaults to `localhost`.

---

## Trigger IdentityUpdated

This script creates a phone attestation in the DB(as if it were the bridge server), uploads the attestation JSON with signature, and fires an `IdentityUpdated` event.

### Environmental Variables

#### `PRIVKEY`

**Required**

The private key for the attestation issuer account.  This needs to match [`attestationIssuer` in the `@origin/graphql` config](https://github.com/OriginProtocol/origin/blob/master/packages/graphql/src/configs/localhost.js#L19) for attestations to pass validation.

#### `IPFS_GATEWAY`

The IPFS gateway base URL to use.  Default: `http://localhost:5002`

#### `ACCOUNT`

The account to use as sender when creating an offer.  Defaults to the first account/coinbase on the node.

#### `NETWORK`

The network configuration to use as configured by `@origin/graphql`.  Defaults to `localhost`.
