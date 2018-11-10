import contracts from '../contracts'

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
  getListing: (contract, args) => contracts.eventSource.getListing(args.id),
  allListings: async (contract, { limit = 10, offset = 0 }) => {
    if (!contract) {
      return null
    }
    const totalListings = await contract.methods.totalListings().call()
    const ids = Array.from({ length: Number(totalListings) }, (v, i) => i)
      .reverse()
      .slice(offset, offset + limit)
    return Promise.all(ids.map(id => contracts.eventSource.getListing(id)))
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
  }
}
