import { ApolloServer } from 'apollo-server'
import { makeExecutableSchema } from 'graphql-tools'

global.fetch = require('node-fetch')

import typeDefs from './typeDefs/index'
import resolvers from './resolvers/server'
import { setNetwork, shutdown } from './contracts'

setNetwork(process.env.NETWORK || 'test')

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
  resolverValidationOptions: { requireResolversForResolveType: false }
})

const options = { schema }

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
