const GraphQLJSON = require('graphql-type-json')

const search = require('../lib/search')
const { getListing, getListingsById, getListingsBySeller, getOffer, getOffers } = require('./db')

/**
 * Gets information on a related user.
 * Includes short-circuit code to skip the user look up
 * if the walletAddress is the only field required.
 * @param {string} walletAddress
 * @param {object} info
 */
function relatedUserResolver (walletAddress, info) {
  const requestedFields = info.fieldNodes[0].selectionSet.selections
  const isIdOnly =
    requestedFields.filter(x => x.name.value !== 'walletAddress').length === 0
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
      // Get listing Ids from Elastic.
      const { listingIds, stats } = await search.Listing.search(
        args.searchQuery,
        args.filters,
        args.page.numberOfItems,
        args.page.offset,
        true // idsOnly
      )
      // Get listing objects from DB based on Ids.
      const listings = await getListingsById(listingIds)
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
      return getListing(args.id)
    },

    async offers (root, args) {
      const offers = await getOffers({
        listingId: args.listingId,
        buyerAddress: args.buyerAddress,
        sellerAddress: args.sellerAddress
      })

      return { nodes: offers }
    },

    async offer (root, args) {
      return getOffer(args.id)
    },

    user (root, args) {
      // FIXME(franck): some users did not get indexed in prod due to a bug in attestations.
      // For now only return the address until data gets re-indexed.
      return { walletAddress: args.walletAddress }
    }
  },

  Listing: {
    seller (listing, args, context, info) {
      return relatedUserResolver(listing.seller, info)
    },

    async offers (listing) {
      const offers = await getOffers({ listingId: listing.id })
      return { nodes: offers }
    }
  },

  Offer: {
    seller (offer, args, context, info) {
      return relatedUserResolver(offer.sellerAddress, info)
    },

    buyer (offer, args, context, info) {
      return relatedUserResolver(offer.buyerAddress, info)
    },

    affiliate ()  {
      //TODO: implement
      return ''
    },

    async listing (offer) {
      return getListing(offer.data.listingId)
    }
  },

  User: {
    // Return offers made by a user.
    async offers (user) {
      const offers = await getOffers({ buyerAddress: user.walletAddress })
      return { nodes: offers }
    },

    // Return listings created by a user.
    async listings (user) {
      const listings = await getListingsBySeller(user.walletAddress)
      return { nodes: listings }
    }
  }
}

module.exports = resolvers
