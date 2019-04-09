# Origin EventCache

The `event-cache` package provides an augmentation to web3.js Contracts to allow caching of events as they are fetched.

## Usage

Best usage is just just patch the Web3 contract

    import { patchWeb3Contract } from 'event-cache'
    
    const identity = IdentityEvents.deploy().send({ from: '0x0b44611b8ae632be05f24ffe64651f050402ae01' })
    patchWeb3Contract(identity)

    // Get all ident updates from a specific user
    const events = await identity.eventCache.getPastEvents('IdentityUpdated', {
      filter: { account: alice }
    })

## EventCache API

For the purpose of this document, we'll call the primary class `EventCache`.  This could probably continue to be a function [like the current implementation](https://github.com/OriginProtocol/origin/blob/master/packages/graphql/src/utils/eventCache.js#L31) that's appended on as a method of `web3.eth.Contract`.  Either way, the API stays the same and should require no changes from dependents.

### Usage

    // Example from graphql contract module:
    marketplace.eventCache = new EventCache({
        contract: marketplace,
        fromBlock: epoch,
        config
    })

- `contract` - The Web3.js initiailzied Contract 
- `fromBlock` - The block number to start from when fetching events
- `config` - A configuration `object`.  See below:

#### `config` object

Example `config` object provided to constructor:

    {
        platform: ['browser', 'mobile', 'nodejs', 'ipfs', 'auto'],
        backend: [EventCacheBackend],
        ipfsEventCache: 'QmO0O0O0base64YOO000000....',
        ipfsGateway: 'http://localhost:8080'
    }

- `platform` will tell EC which backend to use.
- `backend` is an alternative to `platform` and will override any setting there and can provide any object with the Below API
- `ipfsEventcache`: The IPFS hash of the latest known cached results
- `ipfsGateway`: The HTTP(S) IPFS gateway to fetch cached results from

#### `getPastEvents(eventName, options)`

Retrieve all event logs for a specific event.

- `eventName` - The name of the event
- `options` - An object with filters. This [matches the web3.eth.Contract API](https://web3js.readthedocs.io/en/1.0/web3-eth-contract.html#getpastevents)

#### `getEvents(params)`

Retrieve all event logs matching the params. 

- `params` - An object with keys to match against the event name and parameters

##### Example

    await contract.eventCache.getEvents({
        event: 'IdentityUpdated',
        account: '0x0b44611b8ae632be05f24ffe64651f050402ae01'
    })

### `AbstractBackend` API

This is the storage interface that `EventCache` uses to store and fetch events. Any backend implemented needs to match this interface

#### `setLatestBlock(blockNumber)`

Set the latest block number

#### `getLatestBlock()`

Get the latest block number known by the backend

#### `addEvent(eventObject)`

Add an event to the storage.

- `eventObject` - For the structure of `eventObject`, see the [web3.js event Object](https://web3js.readthedocs.io/en/1.0/web3-eth-contract.html#contract-events-return). 

#### `addEvents(arrayOfEventObjects)`

Add a batch of events as an array of event objects(see above).  These can be fed directly from a `web3.eth.Contract`'s `getPastEvents()` call.

#### `get(argMatchObject)`

A general-purpose method to fetch events.  Since there will be many storage backends, a lot of functionality is hidden by this method.  And each backend will probably have a very unique implementation.

- `argMatchObject` - An object to match against event objects
