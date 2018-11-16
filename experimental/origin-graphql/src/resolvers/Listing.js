import contracts from '../contracts'

export default {
  events: async listing =>
    await listing.contract.eventCache.listings(listing.id),
  totalEvents: async listing =>
    (await listing.contract.eventCache.listings(listing.id)).length,
  totalOffers: listing => {
    return listing.contract.methods.totalOffers(listing.id).call()
  },
  offer: async (listing, args) => contracts.eventSource.getOffer(args.id),
  offers: async listing => {
    if (!listing.contract) {
      return null
    }
    const totalOffers = await listing.contract.methods
      .totalOffers(listing.id)
      .call()

    const offers = []
    for (const id of Array.from({ length: Number(totalOffers) }, (v, i) => i)) {
      offers.push(
        await contracts.eventSource.getOffer(listing.id, id)
      )
    }
    return offers
  },
  createdEvent: async listing => {
    const events = await listing.contract.eventCache.listings(
      listing.id,
      'ListingCreated'
    )
    return events[0]
  }
}
