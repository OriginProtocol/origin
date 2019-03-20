import contracts from '../contracts'
import listings from './marketplace/listings'
import users from './marketplace/users'
import parseId from '../utils/parseId'

export default {
  address: contract => {
    if (!contract) {
      return null
    }
    return contract._address
  },
  totalListings: contract => {
    if (!contract) {
      return null
    }
    return contract.methods.totalListings().call()
  },

  listing: async (contract, args) => {
    const { listingId, blockNumber } = parseId(args.id)
    return await contracts.eventSource.getListing(listingId, blockNumber)
  },
  listings,

  offer: async (contract, args) => {
    const { listingId, offerId } = parseId(args.id)
    return contracts.eventSource.getOffer(listingId, offerId)
  },

  account: contract => {
    if (!contract) {
      return null
    }
    return { id: contract._address }
  },
  token: async contract => {
    if (!contract) {
      return null
    }
    return { id: await contract.methods.tokenAddr().call() }
  },
  owner: async contract => {
    if (!contract) {
      return null
    }
    return { id: await contract.methods.owner().call() }
  },
  events: async (_, { limit = 10, offset = 0 }) => {
    const events = await contracts.marketplace.eventCache.allEvents()
    return [...events].reverse().slice(offset, offset + limit)
  },
  totalEvents: async () => {
    const events = await contracts.marketplace.eventCache.allEvents()
    return events.length
  },
  users,
  user: (_, args) => ({ id: args.id, account: { id: args.id } })
}
