import contracts from '../contracts'
import parseId from '../utils/parseId'

export default {
  listing: offer =>
    contracts.eventSource.getListing(offer.listingId, offer.createdBlock),

  createdEvent: async offer => {
    const { listingId, offerId } = parseId(offer.id)
    const events = await offer.contract.eventCache.offers(
      listingId,
      offerId,
      'OfferCreated'
    )
    return events[0]
  }
}
