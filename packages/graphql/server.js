import { ApolloServer } from 'apollo-server'

global.fetch = require('node-fetch')

import typeDefs from './src/typeDefs/index'
import resolvers from './src/resolvers/server'
import { setNetwork, shutdown } from './src/contracts'

setNetwork(process.env.NETWORK || 'test')

const server = new ApolloServer({ typeDefs, resolvers })
server.shutdown = shutdown

// server.listen().then(({ url }) => {
//   console.log(`🚀  Server ready at ${url}`)
// })

export default server
