const GraphQLJSON = require('graphql-type-json')

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
    async listings (root, args) {
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

    async listing (root, args) {
      const listings = await getListings([args.id])
      return (listings.length === 1) ? listings[0] : null
    },

    async offers (root, args) {
      const opts = {}
      opts.buyerAddress = args.buyerAddress
      opts.listingId = args.listingId
      const offers = search.Offer.search(opts)
      return { nodes: offers }
    },

    async offer (root, args) {
      return search.Offer.get(args.id)
    },

    user (root, args) {
      return search.User.get(args.walletAddress)
    }
  },

  Listing: {
    seller (listing, args, context, info) {
      return relatedUserResolver(listing.seller, info)
    },
    offers (listing) {
      const offers = search.Offer.search({ listingId: listing.id })
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
    listing (offer, args, context, info) {
      const requestedSubFields = info.fieldNodes[0].selectionSet.selections
      const isIdOnly = requestedSubFields.filter(x => x.name.value !== 'id').length === 0
      if (isIdOnly) {
        return { id: offer.listingId }
      } else {
        return search.Listing.get(offer.listingId)
      }
    }
  },

  User: {
    offers (user) {
      const offers = search.Offer.search({ buyer: user.walletAddress })
      return { nodes: offers }
    }
  }
}

module.exports = resolvers
