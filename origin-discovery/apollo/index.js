/*
 * Implementation of the Origin GraphQL server.
 * Uses the Apollo framework: https://www.apollographql.com/server
 */
const { ApolloServer } = require('apollo-server')

const resolvers = require('./resolvers.js')
const typeDefs = require('./schema.js')


// Start ApolloServer by passing type definitions and the resolvers
// responsible for fetching the data for those types.
const server = new ApolloServer({ typeDefs, resolvers })

// The `listen` method launches a web-server.
server.listen().then(({ url }) => {
  console.log(`Apollo server ready at ${url}`)
})
