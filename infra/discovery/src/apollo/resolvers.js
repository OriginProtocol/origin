const GraphQLJSON = require('graphql-type-json')
const listingMetadata = require('./listing-metadata')
const search = require('../lib/search')
const {
  getListing,
  getListingsById,
  getListingsBySeller,
  getOffer,
  getOffers
} = require('./db')
const { injectListing, updateListing } = require('./injector')

/**
 * Gets information on a user based on her wallet address.
 * @param {string} walletAddress
 */
function userResolver(walletAddress) {
  // TODO: re-enable returning full user info once user indexing
  // is fully functional (see notes in rules.js).
  return { walletAddress: walletAddress }
}

// Resolvers define the technique for fetching the types in the schema.
const resolvers = {
  JSON: GraphQLJSON,
  Query: {
    async listings(root, args) {
      // Get listing Ids from Elastic.
      const { listingIds, stats } = await search.Listing.search(
        args.searchQuery,
        args.filters,
        args.page.numberOfItems,
        args.page.offset,
        true, // idsOnly
        listingMetadata.hiddenIds,
        listingMetadata.featuredIds
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

    async listing(root, args) {
      return getListing(args.id, args.blockInfo)
    },

    async offers(root, args) {
      const offers = await getOffers({
        listingId: args.listingId,
        buyerAddress: args.buyerAddress,
        sellerAddress: args.sellerAddress
      })

      return { nodes: offers }
    },

    async offer(root, args) {
      return getOffer(args.id)
    },

    user(root, args) {
      // FIXME(franck): some users did not get indexed in prod due to a bug in attestations.
      // For now only return the address until data gets re-indexed.
      return { walletAddress: args.walletAddress }
    },

    info() {
      // Caution: Any config added here gets exposed publicly.
      // Make sure to not expose any credentials/secrets !
      return {
        networkId: process.env.NETWORK_ID
          ? process.env.NETWORK_ID
          : 'undefined',
        elasticsearchHost: process.env.ELASTICSEARCH_HOST
          ? process.env.ELASTICSEARCH_HOST
          : 'undefined',
        nodeEnv: process.env.NODE_ENV ? process.env.NODE_ENV : 'undefined'
      }
    }
  },

  Mutation: {
    async injectListing(node, args) {
      // verify args.signature checks against args.listingInput
      return await injectListing(args.listingInput, args.signature)
    },
    async updateListing(node, args) {
      // verify args.signature checks against args.listingInput
      return await updateListing(args.id, args.listingInput, args.signature)
    }
  },

  Listing: {
    seller(listing) {
      return userResolver(listing.seller)
    },

    async offers(listing) {
      const offers = await getOffers({ listingId: listing.id })
      return { nodes: offers }
    }
  },

  Offer: {
    seller(offer) {
      return userResolver(offer.sellerAddress)
    },

    buyer(offer) {
      return userResolver(offer.buyerAddress)
    },

    affiliate() {
      //TODO: implement
      return ''
    },

    async listing(offer) {
      // Note: fetch listing version relative to the offer's blockInfo.
      return getListing(offer.data.listingId, offer.blockInfo)
    }
  },

  User: {
    // Return offers made by a user.
    async offers(user) {
      const offers = await getOffers({ buyerAddress: user.walletAddress })
      return { nodes: offers }
    },

    // Return listings created by a user.
    async listings(user) {
      const listings = await getListingsBySeller(user.walletAddress)
      return { nodes: listings }
    }
  }
}

module.exports = resolvers
