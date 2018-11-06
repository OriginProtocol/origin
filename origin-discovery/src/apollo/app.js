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

const app = express()
const bundle = promBundle({
  promClient: {
    collectDefaultMetrics: {
      timeout: 1000
    }
  }
})
app.use(bundle)

const networkId = process.env.NETWORK_ID
const featuredListingsUrl = `https://raw.githubusercontent.com/OriginProtocol/origin/hidefeature_list/featurelist_${networkId}.txt`
const hiddenListingsUrl = `https://raw.githubusercontent.com/OriginProtocol/origin/hidefeature_list/hidelist_${networkId}.txt`
let hiddenListings = []
let featuredListings = []

async function readListingsFromUrl(githubUrl){
  let response = await fetch(githubUrl)
  return (await response.text())
    .split(',')
    .map(listingId => listingId.trim())
    .filter(listingId => listingId.match(/\d*-\d*-\d*/) !== null)
}
 async function updateHiddenFeaturedListings(){
  if (!listingsUpdateTime || new Date() - listingsUpdateTime > LISTINGS_STALE_TIME){
    try{
      listingsUpdateTime = new Date()
      hiddenListings = await readListingsFromUrl(hiddenListingsUrl)
      featuredListings = await readListingsFromUrl(featuredListingsUrl)
    } catch(e) {
      console.error("Could not update hidden/featured listings ", e)
    }
  }
}

// Start ApolloServer by passing type definitions and the resolvers
// responsible for fetching the data for those types.
const server = new ApolloServer({
  resolvers: getResolvers(hiddenListings, featuredListings),
  typeDefs,
  context: async ({ req }) => {
    // update listingIds in a non blocking way
    updateHiddenFeaturedListings()
     return {}
  }})

server.applyMiddleware({ app })

// initial fetch of ids at the time of starting the server
updateHiddenFeaturedListings()

const port = process.env.PORT || 4000

app.listen({ port: port }, () =>
  console.log(`Apollo server ready at http://localhost:${port}${server.graphqlPath}`)
)
