import contracts from '../contracts'

export default {
  listing: offer =>
    contracts.eventSource.getListing(offer.listingId, offer.createdBlock)
}
