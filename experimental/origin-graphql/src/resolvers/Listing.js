import contracts from '../contracts'
import parseId from '../utils/parseId'
import { getFeatured, getHidden } from './marketplace/_featuredAndHidden'

export default {
  __resolveType() {
    return 'UnitListing'
  },
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
  offers: async listing => listing.allOffers.filter(o => o.valid),
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
  },
  price: listing => listing.price || {}
}
