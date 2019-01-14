import contracts from '../contracts'
import parseId from '../utils/parseId'

import { getIpfsHashFromBytes32 } from 'origin-ipfs'

export default {
  listing: offer =>
    contracts.eventSource.getListing(offer.listingId, offer.createdBlock),

  events: async offer => {
    const { listingId, offerId } = parseId(offer.id)
    return await offer.contract.eventCache.offers(listingId, offerId)
  },

  history: async offer => {
    const { listingId, offerId } = parseId(offer.id)
    const events = await offer.contract.eventCache.offers(listingId, offerId)
    return events.map(event => {
      const ipfsHash = getIpfsHashFromBytes32(event.returnValues.ipfsHash)
      return {
        id: event.transactionHash,
        event,
        ipfsHash,
        ipfsUrl: `${contracts.ipfsGateway}/ipfs/${ipfsHash}`,
        party: { id: event.returnValues.party }
      }
    })
  },

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
