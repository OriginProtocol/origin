const GraphQLJSON = require('graphql-type-json')
const listingMetadata = require('./listing-metadata')
const logger = require('./logger')
const search = require('../lib/search')
const db = require('../models')

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
      logger.info(
        `Query: "${args.searchQuery}" returned ${listingIds.length} results.`
      )
      return {
        nodes: listingIds.map(x => Object.assign({}, { id: x })),
        offset: args.page.offset,
        numberOfItems: listingIds.length,
        totalNumberOfItems: stats.totalNumberOfListings,
        stats: {
          maxPrice: stats.maxPrice,
          minPrice: stats.minPrice
        }
      }
    },

    async listing(root, args) {
      const id = args.id
      const listing = await search.Listing.get(id)
      if (listing._source.scoreTags === undefined) {
        listing._source.scoreTags = []
      }
      return listing._source
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
    async listingSetScoreTags(_, data) {
      const { id, scoreTags } = data
      await db.DiscoveryTagAction.create({
        ethAddress: 'mu',
        ListingId: id,
        data: { tags: scoreTags }
      })
      return search.Listing.updateScoreTags(id, scoreTags)
    }
  }
}

module.exports = resolvers
