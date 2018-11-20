import { ApolloServer } from 'apollo-server'
import Web3 from 'web3'

global.web3 = new Web3('wss://mainnet.infura.io/ws')
global.fetch = require('node-fetch')

import typeDefs from './src/typeDefs/index'
import resolvers from './src/resolvers/index'
import { setNetwork } from './src/contracts'

setNetwork('mainnet')

const server = new ApolloServer({ typeDefs, resolvers })

server.listen().then(async ({ url }) => {
  console.log(`🚀  Server ready at ${url}`)
})
