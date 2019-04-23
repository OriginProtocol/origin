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

const server = new ApolloServer({ schema })
server.shutdown = shutdown

export default server
