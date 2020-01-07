/*
 * Implementation of the Origin Growth GraphQL server.
 * Uses the Apollo framework: https://www.apollographql.com/server
 */
require('dotenv').config()

try {
  require('envkey')
} catch (error) {
  console.log('EnvKey not configured')
}

const { ApolloServer } = require('apollo-server-express')
const cors = require('cors')
const express = require('express')
const promBundle = require('express-prom-bundle')
const morgan = require('morgan')

const logger = require('./logger')
const resolvers = require('./resolvers')
const typeDefs = require('./schema')

const app = express()
app.use(cors())

const bundle = promBundle({
  promClient: {
    collectDefaultMetrics: {
      timeout: 1000
    }
  }
})
app.use(bundle)

// Extract functions name and calling args.
const gqlQueryExtractRe = /query *(.*) *\{/

// Extract at most 32 chars to avoid spamming the logs.
const queryMaxExtractSize = 32

// Utility method to extract a Graphl query from the POST body.
function extractGqlQuery(req) {
  if (!req.body || !req.body.query) {
    return ''
  }
  const query = req.body.query
  const matches = query.match(gqlQueryExtractRe)
  if (matches && matches.length) {
    return matches[1].slice(0, queryMaxExtractSize)
  }
  // Fallback to extract the first 32 chars after the query string.
  console.log('FALLING BACK')
  return query.slice(query.indexOf('query'), queryMaxExtractSize)
}

app.use(morgan(function (tokens, req, res) {
  const gqlQuery = extractGqlQuery(req)
  return [
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    tokens.res(req, res, 'content-length'), '-',
    tokens['response-time'](req, res), 'ms',
    gqlQuery
  ].join(' ')
}))

// Start ApolloServer by passing type definitions and the resolvers
// responsible for fetching the data for those types.
const server = new ApolloServer({
  resolvers,
  typeDefs,
  context: async context => {
    const headers = context.req.headers
    if (headers['x-discovery-auth-token']) {
      context.discoveryAuthToken = headers['x-discovery-auth-token']
    }
    return context
  },
  // Enable debug regardless of NODE_ENV value in order to include stack traces in errors.
  debug: true,
  // Error handler that writes to the server logs.
  formatError: err => {
    logger.error(JSON.stringify(err, null, 4))
    return err
  },
  // Always enable GraphQL playground and schema introspection, regardless of NODE_ENV value.
  introspection: true,
  playground: true
})

server.applyMiddleware({ app })

// Initial fetch of ids at the time of starting the server.

const port = process.env.PORT || 4000

app.listen({ port: port }, () =>
  console.log(
    `Apollo server ready at http://localhost:${port}${server.graphqlPath}`
  )
)
