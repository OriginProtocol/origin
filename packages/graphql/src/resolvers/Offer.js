import contracts from '../contracts'
import parseId from '../utils/parseId'
import currencies from '../utils/currencies'
import get from 'lodash/get'

import { getIpfsHashFromBytes32 } from '@origin/ipfs'

const _firstEventByType = async (offer, eventType) => {
  const { listingId, offerId } = parseId(offer.id)
  const events = await offer.contract.eventCache.getEvents({
    listingID: listingId,
    offerID: offerId,
    event: eventType
  })
  return events[0]
}

export default {
  listing: async offer => {
    const { listingId } = parseId(offer.listingId)
    return contracts.eventSource.getListing(listingId, offer.createdBlock)
  },

  events: async offer => {
    const { listingId, offerId } = parseId(offer.id)
    return await offer.contract.eventCache.getEvents({ listingID: listingId, offerID: offerId})
  },

  history: async offer => {
    const { listingId, offerId } = parseId(offer.id)
    const events = await offer.contract.eventCache.getEvents({ listingID: listingId, offerID: offerId})
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

  createdEvent: async offer => _firstEventByType(offer, 'OfferCreated'),
  acceptedEvent: async offer => _firstEventByType(offer, 'OfferAccepted'),
  finalizedEvent: async offer => _firstEventByType(offer, 'OfferFinalized'),
  withdrawnEvent: async offer => _firstEventByType(offer, 'OfferWithdrawn'),
  fundsAddedEvent: async offer => _firstEventByType(offer, 'OfferFundsAdded'),
  disputedEvent: async offer => _firstEventByType(offer, 'OfferDisputed'),
  rulingEvent: async offer => _firstEventByType(offer, 'OfferRuling'),

  totalPrice: async offer => {
    return {
      amount: offer.totalPrice.amount,
      currency: await currencies.get(
        get(offer, 'totalPrice.currency.id', 'token-ETH')
      )
    }
  }
}
