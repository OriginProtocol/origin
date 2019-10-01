import { ApolloServer } from 'apollo-server'
import { makeExecutableSchema } from 'graphql-tools'

global.fetch = require('node-fetch')

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

const server = new ApolloServer(options)
server.shutdown = shutdown

export default server
