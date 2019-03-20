import { ApolloServer } from 'apollo-server'
import Web3 from 'web3'

global.web3 = new Web3('wss://mainnet.infura.io/ws')
global.fetch = require('node-fetch')

import typeDefs from './src/graphql/typeDefs'
import resolvers from './src/graphql/resolvers'

import MarketplaceContract from './src/graphql/contracts/V00_Marketplace'
import UserRegistryContract from './src/graphql/contracts/V00_UserRegistry'
import ClaimHolderRegisteredContract from './src/graphql/contracts/ClaimHolderRegistered'
import TokenContract from './src/graphql/contracts/OriginToken'
import eventCache from './src/graphql/utils/eventCache'

const EventBlock = 6400000

const context = {
  ipfsGateway: `https://ipfs.originprotocol.com`,
  ipfsRPC: `http://localhost:5002`,
  claimHolderRegistered: new web3.eth.Contract(
    ClaimHolderRegisteredContract.abi
  ),
  userRegistry: new web3.eth.Contract(
    UserRegistryContract.abi,
    '0xa4428439ec214cc68240552ec93298d1da391114'
  ),
  marketplace: new web3.eth.Contract(
    MarketplaceContract.abi,
    '0x819bb9964b6ebf52361f1ae42cf4831b921510f9'
  ),
  ogn: new web3.eth.Contract(
    TokenContract.abi,
    '0x8207c1ffc5b6804f6024322ccf34f29c3541ae26'
  )
}

context.marketplace.eventCache = eventCache(context.marketplace, EventBlock)

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: () => ({ contracts: context })
})

// This `listen` method launches a web-server.  Existing apps
// can utilize middleware options, which we'll discuss later.
server.listen().then(async ({ url }) => {
  console.log(`🚀  Server ready at ${url}`)
})
