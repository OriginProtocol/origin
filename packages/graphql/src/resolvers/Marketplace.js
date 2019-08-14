import contracts from '../contracts'
import listings from './marketplace/listings'
import users from './marketplace/users'
import parseId from '../utils/parseId'
import apolloPathToString from '../utils/apolloPathToString'

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

  listing: async (contract, args, context, info) => {
    if (info && info.cacheControl) {
      info.cacheControl.setCacheHint({ maxAge: 15 })
    }
    const { listingId, blockNumber, contractId } = parseId(args.id)
    if (!contracts.marketplaces[contractId]) {
      return null
    }
    const eventSource = contracts.marketplaces[contractId].eventSource
    return await eventSource.getListing(listingId, blockNumber)
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
  user: (_, args, context, info) => {
    if (!args.id) {
      console.log(
        '================== Non-nullable error about to happen! =================='
      )
      console.log('User.id', args.id)
      console.log('path: ', apolloPathToString(info.path))
      console.log('returnType: ', info.returnType)
      console.log('operation: ', info.operation.operation)
      console.log(
        '========================================================================='
      )
      return null
    }
    return { id: args.id, account: { id: args.id } }
  }
}
