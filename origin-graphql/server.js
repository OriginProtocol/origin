import { ApolloServer } from 'apollo-server'

global.fetch = require('node-fetch')

import typeDefs from './src/typeDefs/index'
import resolvers from './src/resolvers/server'
import contracts, { setNetwork } from './src/contracts'

setNetwork('localhost')

// Managed wallet: 0x1bbFBb2dAc53Da46e2a675aD956ACd82aBC96866
contracts.web3.eth.accounts.wallet.add(
  '0x03707fb38e46dd73f22e431b1cd70f924e8fa36e3e78e6f36ae051f35f2fe402'
)

const server = new ApolloServer({
  typeDefs,
  resolvers,
  resolverValidationOptions: {
    requireResolversForResolveType: false
  },
  playground: true,
  introspection: true,
  // context: ({ req }) => {
  //   if (req.headers.authorization === '0x1bbFBb2dAc53Da46e2a675aD956ACd82aBC96866') {
  //     return { web3 }
  //   }
  // }
})

server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`)
})
