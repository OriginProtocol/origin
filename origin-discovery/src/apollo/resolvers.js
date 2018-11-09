const GraphQLJSON = require('graphql-type-json')

const db = require('../models')
const search = require('../lib/search.js')
const { getListings } = require('./db.js')

/**
 * Gets information on a related user.
 * Includes short-circuit code to skip the user look up
 * if the walletAddress is the only field required.
 * @param {string} walletAddress
 * @param {object} info
 */
function relatedUserResolver (walletAddress, info) {
  const requestedFields = info.fieldNodes[0].selectionSet.selections
  const isIdOnly = requestedFields.filter(x => x.name.value !== 'walletAddress')
    .length === 0
  if (isIdOnly) {
    return { walletAddress: walletAddress }
  } else {
    return search.User.get(walletAddress)
  }
}

// Resolvers define the technique for fetching the types in the schema.
const resolvers = {
  JSON: GraphQLJSON,
  Query: {
    async listings (root, args, context, info) {
      // TODO: handle pagination (including enforcing MaxResultsPerPage), filters, order.
      // Get listing Ids from Elastic.
      const { listingIds, stats } = await search.Listing
        .search(
          args.searchQuery,
          args.filters,
          args.page.numberOfItems,
          args.page.offset,
          true // idsOnly
        )
      // Get listing objects based on Ids from DB.
      const listings = await getListings(listingIds)

      return {
        nodes: listings,
        offset: args.page.offset,
        numberOfItems: listings.length,
        totalNumberOfItems: stats.totalNumberOfListings,
        stats: {
          maxPrice: stats.maxPrice,
          minPrice: stats.minPrice
        }
      }
    },

    async listing (root, args, context, info) {
      const listings = await getListings([args.id])
      return (listings.length === 1) ? listings[0] : null
    },

    async offers (root, args, context, info) {
      const clause = {}
      if (args.listingId) {
        clause.listingId = args.listingId
      }
      if (args.buyerAddress) {
        clause.buyerAddress = args.buyerAddress.toLowerCase()
      }
      if (args.sellerAddress) {
        clause.sellerAddress = args.sellerAddress.toLowerCase()
      }
      const rows = await db.Offer.findAll({ where: clause })
      const offers = rows.map(offer => offer.data)
      return { nodes: offers }
    },

    async offer (root, args, context, info) {
      const row = await db.Offer.findByPk({ id: args.id })
      return (row.length === 0) ? row.data : null
    },

    user (root, args, context, info) {
      // FIXME(franck): some users did not get indexed due to attestation overflow bug.
      // For now only return the address until data gets re-indexed.
      return { walletAddress: args.walletAddress }
    }
  },

  Listing: {
    seller (listing, args, context, info) {
      return relatedUserResolver(listing.seller, info)
    },
    async offers (listing, args, context, info) {
      const rows = await db.Offer.findAll({ where: { listingId: listing.id } })
      const offers = rows.map(offer => offer.data)
      return { nodes: offers }
    }
  },

  Offer: {
    seller (offer, args, context, info) {
      return relatedUserResolver(offer.seller, info)
    },
    buyer (offer, args, context, info) {
      return relatedUserResolver(offer.buyer, info)
    },
    price (offer) {
      return { currency: 'ETH', amount: offer.priceEth }
    },
    async listing (offer, args, context, info) {
      const requestedSubFields = info.fieldNodes[0].selectionSet.selections
      const idsOnly = requestedSubFields.filter(x => x.name.value !== 'id').length === 0
      if (idsOnly) {
        return { id: offer.listingId }
      } else {
        const row = await db.Listing.findByPk(offer.listingId)
        return row.data
      }
    }
  },

  User: {
    async offers (user, args, context, info) {
      // Return offers made by the user.
      console.log('LOADING OFFERS FOR BUYER=', user.walletAddress.toLowerCase())
      const rows = await db.Offer.findAll(
        { where: { buyerAddress: user.walletAddress.toLowerCase() } })
      const offers = rows.map(row => row.data)
      console.log('FOUND offer ', offers)
      return { nodes: offers }
    },
    async listings (user, args, context, info) {
      // Return listings created by the user.
      console.log('LOADING LISTING FOR SELLER=', user.walletAddress.toLowerCase())
      const rows = await db.Listing.findAll(
        { where: { sellerAddress: user.walletAddress.toLowerCase() } })
      const listings = rows.map(row => row.data)
      console.log('FOUND listingS:', listings)
      return { nodes: listings }
    }
  }
}

module.exports = resolvers
