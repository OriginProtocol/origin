const GraphQLJSON = require('graphql-type-json')
const listingMetadata = require('./listing-metadata')
const search = require('../lib/search')

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
  }
}

module.exports = resolvers
