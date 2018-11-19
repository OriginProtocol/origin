# Origin EventSource

The Origin Marketplace contract emits events when users take actions such as
creating listings or making offers. In order to arrive at the current state of a
listing or offer, all prior events must be considered.

For example, the `status` property of a listing will need to change from
`available` to `sold` once an offer has been made. For multi-unit listings,
`availableUnits` will have to be decremented for every successful sale. Once
`availableUnits` reaches 0, `status` should change from `available` to
`out of stock`.

Ths module provides a simple API for retrieving the current state of a listing
or offer. It works something like this:

1. Fetch all relevant events from the ethereum node for the given listing or offer
2. Fetch all IPFS objects for those events
3. Loop through the events and apply transformations and computations
4. Ensure objects match the relevant JSON Schema after each stage
5. Return the final state

## Usage

```
import EventSource from 'origin-eventsource'

const eventSource = new EventSource({
  marketplaceContract: MarketplaceContractInstance,
  ipfsGateway: "https://ipfs.originprotocol.com"
})

const listing = eventSource.getListing('0')
console.log(listing)

const offer = eventSource.getOffer('0', '0')
console.log(offer)

```
