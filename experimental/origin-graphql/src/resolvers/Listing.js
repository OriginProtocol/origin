import contracts from '../contracts'
import parseId from '../utils/parseId'
import { getFeatured, getHidden } from './marketplace/_featuredAndHidden'

export default {
  events: async listing =>
    await listing.contract.eventCache.listings(listing.id),
  totalEvents: async listing =>
    (await listing.contract.eventCache.listings(listing.id)).length,
  totalOffers: listing => {
    return listing.contract.methods.totalOffers(listing.id).call()
  },
  offer: async (listing, args) => {
    const { listingId, offerId } = parseId(args.id)
    return contracts.eventSource.getOffer(listingId, offerId)
  },
  offers: async listing => {
    if (!listing.contract) {
      return null
    }
    const totalOffers = await listing.contract.methods
      .totalOffers(listing.id)
      .call()

    const offers = []
    for (const id of Array.from({ length: Number(totalOffers) }, (v, i) => i)) {
      offers.push(await contracts.eventSource.getOffer(listing.id, id))
    }
    return offers
  },
  createdEvent: async listing => {
    const events = await listing.contract.eventCache.listings(
      listing.id,
      'ListingCreated'
    )
    return events[0]
  },
  featured: async listing => {
    const featuredIds = await getFeatured(contracts.net)
    return featuredIds.indexOf(listing.id) >= 0
  },
  hidden: async listing => {
    const hiddenIds = await getHidden(contracts.net)
    return hiddenIds.indexOf(listing.id) >= 0
  }
}
