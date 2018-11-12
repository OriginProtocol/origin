/*
 * Implementation of the Origin GraphQL server.
 * Uses the Apollo framework: https://www.apollographql.com/server
 */
require('dotenv').config()

try {
  require('envkey')
} catch (error) {
  console.log('EnvKey not configured')
}

const { ApolloServer } = require('apollo-server-express')
const express = require('express')
const promBundle = require('express-prom-bundle')

const getResolvers = require('./resolvers.js')
const typeDefs = require('./schema.js')
const ListingMetadata = require('./listing-metadata')

const app = express()
const bundle = promBundle({
  promClient: {
    collectDefaultMetrics: {
      timeout: 1000
    }
  }
})
app.use(bundle)

const listingMetadata = new ListingMetadata()
// Start ApolloServer by passing type definitions and the resolvers
// responsible for fetching the data for those types.
const server = new ApolloServer({
  resolvers: getResolvers(listingMetadata.listingInfo),
  typeDefs,
  context: async () => {
    // update listingIds in a non blocking way
    listingMetadata.updateHiddenFeaturedListings()
    return {}
  } })

server.applyMiddleware({ app })

// initial fetch of ids at the time of starting the server
listingMetadata.updateHiddenFeaturedListings()

const port = process.env.PORT || 4000

app.listen({ port: port }, () =>
  console.log(`Apollo server ready at http://localhost:${port}${server.graphqlPath}`)
)
