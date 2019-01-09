import contracts from '../contracts'
import parseId from '../utils/parseId'
import { getFeatured, getHidden } from './marketplace/_featuredAndHidden'

export default {
  events: async listing => {
    const { listingId } = parseId(listing.id)
    return await listing.contract.eventCache.listings(listingId)
  },
  totalEvents: async listing => {
    const { listingId } = parseId(listing.id)
    return (await listing.contract.eventCache.listings(listingId)).length
  },
  totalOffers: listing => {
    const { listingId } = parseId(listing.id)
    return listing.contract.methods.totalOffers(listingId).call()
  },
  offer: async (listing, args) => {
    const { listingId, offerId } = parseId(args.id)
    return contracts.eventSource.getOffer(listingId, offerId)
  },
  offers: async listing => {
    if (!listing.contract) {
      return null
    }
    const { listingId } = parseId(listing.id)
    const totalOffers = await listing.contract.methods
      .totalOffers(listingId)
      .call()

    const offers = []
    for (const id of Array.from({ length: Number(totalOffers) }, (v, i) => i)) {
      offers.push(await contracts.eventSource.getOffer(listingId, id))
    }
    return offers
  },
  createdEvent: async listing => {
    const { listingId } = parseId(listing.id)
    const events = await listing.contract.eventCache.listings(
      listingId,
      'ListingCreated'
    )
    return events[0]
  },
  featured: async listing => {
    const { listingId } = parseId(listing.id)
    const featuredIds = await getFeatured(contracts.net)
    return featuredIds.indexOf(listingId) >= 0
  },
  hidden: async listing => {
    const { listingId } = parseId(listing.id)
    const hiddenIds = await getHidden(contracts.net)
    return hiddenIds.indexOf(listingId) >= 0
  }
}
