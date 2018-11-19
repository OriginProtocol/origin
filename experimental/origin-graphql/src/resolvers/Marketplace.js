import contracts from '../contracts'
import listings from './marketplace/listings'
import groupBy from 'lodash/groupBy'
import sortBy from 'lodash/sortBy'

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

  listing: (contract, args) => contracts.eventSource.getListing(args.id),
  listings,

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
  sellers: async () => {
    const events = await contracts.marketplace.eventCache.allEvents(
      'ListingCreated'
    )
    const sellers = groupBy(events, e => e.returnValues.party)
    const list = Object.keys(sellers).map(seller => ({
      id: seller,
      account: { id: seller },
      totalCount: sellers[seller].length
    }))
    return sortBy(list, i => -i.totalCount)
  },
  seller: async (contract, args) => {
    const events = await contracts.marketplace.eventCache.allEvents(
      'ListingCreated',
      args.id
    )
    return {
      id: args.id,
      account: { id: args.id },
      totalCount: events.length
    }
  }
}
