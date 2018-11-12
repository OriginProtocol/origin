const GraphQLJSON = require('graphql-type-json')

const db = require('../models')
const search = require('../lib/search')
const { getListing, getListingsById, getListingsBySeller, getOffer, searchOffers } = require('./db')

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
    async listings (root, args, context, info) {
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

    async listing (root, args, context, info) {
      return getListing(args.id)
    },

    async offers (root, args, context, info) {
      const offers = await searchOffers(
        args.listingId,
        args.buyerAddress.toLowerCase(),
        args.sellerAddress.toLowerCase()
      )
      
      return { nodes: offers }
    },

    async offer (root, args, context, info) {
      return await getOffer(args.id)
    },

    user (root, args, context, info) {
      // FIXME(franck): some users did not get indexed in prod due to a bug in attestations.
      // For now only return the address until data gets re-indexed.
      return { walletAddress: args.walletAddress }
    }
  },

  Listing: {
    seller (listing, args, context, info) {
      return relatedUserResolver(listing.seller, info)
    },

    async offers (listing, args, context, info) {
      const offers = await searchOffers(args.listingId)
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
      return offer.totalPrice
    },

    // TODO: check if this is correct. Do we need this or should it be read from the 'data' field. Similar question
    // for total price
    affiliate (offer) {
      return offer.affiliate
    },

    async listing (offer, args, context, info) {
      return getListing(offer.listingId)
    }
  },

  User: {
    // Return offers made by a user.
    async offers (user, args, context, info) {
      const offers = await searchOffers(null, user.walletAddress.toLowerCase())
      return { nodes: offers }
    },

    // Return listings created by a user.
    async listings (user, args, context, info) {
      const listings = await getListingsBySeller(user.walletAddress)
      return { nodes: listings }
    }
  }
}

module.exports = resolvers
