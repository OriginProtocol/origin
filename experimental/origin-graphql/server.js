import { ApolloServer } from 'apollo-server'

global.fetch = require('node-fetch')

import typeDefs from './src/typeDefs/index'
import resolvers from './src/resolvers/server'
import { setNetwork } from './src/contracts'

setNetwork('mainnet')

const server = new ApolloServer({ typeDefs, resolvers })

server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`)
})
