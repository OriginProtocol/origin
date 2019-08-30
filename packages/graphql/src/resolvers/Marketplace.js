import contracts from '../contracts'
import listings from './marketplace/listings'
import users from './marketplace/users'
import { listingIsVisible } from '../utils/listingVisibility'
import parseId from '../utils/parseId'
import { getListingId } from '../utils/getId'
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
    const { netId, contractId, marketplace, listingId, blockNumber } = parseId(
      args.id,
      contracts
    )
    if (!marketplace) {
      return null
    }

    // If a discovery server is configured, check the listing's visibility.
    // TODO: Support an optional argument for the client to be able to specify
    // whether the visibility check should be applied. In some rare cases, the DAp
    // may want to display a listing even though it is hidden. For example if
    // there is an offer on a listing and either the buyer or the seller is requesting the data.
    if (contracts.discovery) {
      const id = getListingId(netId, contractId, listingId)
      if (!(await listingIsVisible(id))) {
        return null
      }
    }

    return await marketplace.eventSource.getListing(listingId, blockNumber)
  },
  listings,

  offer: async (contract, args) => {
    const { marketplace, listingId, offerId } = parseId(args.id, contracts)
    if (!marketplace) return null

    return marketplace.eventSource.getOffer(listingId, offerId)
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
