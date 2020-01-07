import express from 'express'
import { ApolloServer } from 'apollo-server-express'
import { makeExecutableSchema } from 'graphql-tools'
import morgan from 'morgan'

global.fetch = require('node-fetch')

import { bundle } from './prom'
import typeDefs from './typeDefs/index'
import resolvers from './resolvers/server'
import { setNetwork, shutdown } from './contracts'

setNetwork(process.env.NETWORK || 'test', {
  performanceMode: false,
  useMetricsProvider: process.env.USE_METRICS_PROVIDER === 'true',
  proxyAccountsEnabled: process.env.PROXY_ACCOUNTS_ENABLED === 'true'
})

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
  resolverValidationOptions: { requireResolversForResolveType: false }
})

const options = {
  schema,
  // Enable debug regardless of NODE_ENV value in order to include stack traces in errors.
  debug: true,
  // Error handler that writes to the server logs.
  formatError: err => {
    console.log('ERROR:', JSON.stringify(err, null, 4))
    return err
  },
  context: ({ req }) => {
    const operation = req ? req.body : null
    if (operation && operation.query) {
      /**
       * TODO: Maybe check how apollo parses queries and use the same parser.
       * There could be a case here where a character is inserted before
       * 'mutation' in the query body that apollo would ignore, but would cause
       * this to fail.  While I don't think any of the mutations being run from
       * the server are *dangerous*, it sure isn't ideal and could have some
       * unintended side-effects.
       */
      const match = operation.query.match(/^\s*(mutation)/)
      if (match) {
        console.warn(
          `Mutations not allowed.  Operation: ${operation.operationName}`
        )
        throw new Error('Mutations not allowed')
      }
    }
  },
  // Always enable GraphQL playground and schema introspection, regardless of NODE_ENV value.
  introspection: true,
  playground: true
}

/**
 * `ENGINE_API_KEY` is the default that Apollo uses and what it specifies in
 * the docs.  `APOLLO_METRICS_API_KEY` was chosen for clarity, but both are
 * supported here on the off chance someone uses the former.  Without supporting
 * both, it may cause some unexpected behavior that I'd rather not have to chase
 * down later.
 */
const API_KEY = process.env.ENGINE_API_KEY || process.env.APOLLO_METRICS_API_KEY
if (typeof API_KEY !== 'undefined') {
  options.engine = {
    apiKey: API_KEY,
    generateClientInfo: ({ request }) => {
      const headers = request.http && request.http.headers
      if (headers) {
        return {
          clientName: headers['apollo-client-name'],
          clientVersion: headers['apollo-client-version']
        }
      } else {
        return {
          clientName: 'Unknown Client',
          clientVersion: 'Unversioned'
        }
      }
    }
  }
}

const app = express()
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

app.use(
  morgan(function(tokens, req, res) {
    const gqlQuery = extractGqlQuery(req)
    return [
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      tokens.res(req, res, 'content-length'),
      '-',
      tokens['response-time'](req, res),
      'ms',
      gqlQuery
    ].join(' ')
  })
)

const server = new ApolloServer(options)
server.applyMiddleware({ app })
server.shutdown = shutdown

export default app
