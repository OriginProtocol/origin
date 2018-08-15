const { ApolloServer, gql } = require('apollo-server')

var search = require('../lib/search.js')
var db = require('../lib/db.js')

/*
 * Implentation of a GraphQL server using the Apollo framework.
 * See https://www.apollographql.com/server
 *
 */

// Type definitions define the "shape" of the data and specify
// which ways the data can be fetched from the GraphQL server.
const typeDefs = gql`
  type Listing {
    id: String
    name: String
    description: String
    price: Float
  }

  # The "Query" type is the root of all GraphQL queries.
  type Query {
    Listings(query: String): [Listing],
  }
`

// Resolvers define the technique for fetching the types in the schema.
const resolvers = {
  Query: {
    Listings(root, args, context, info) {
      if (args.query) {
        return search.Listing.search(args.query)
      } else {
        return db.Listing.all()
      }
    },
  },
}

// Start ApolloServer by passing type definitions (typeDefs) and the resolvers
// responsible for fetching the data for those types.
const server = new ApolloServer({ typeDefs, resolvers })

// The `listen` method launches a web-server.
server.listen().then(({ url }) => {
  console.log(`Apollo server ready at ${url}`)
})
