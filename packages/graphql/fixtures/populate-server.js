import fetch from 'node-fetch'
import ws from 'ws'
import fs from 'fs'

import { makeExecutableSchema } from 'graphql-tools'
import ApolloClient from 'apollo-client'
import { ApolloServer } from 'apollo-server'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { WebSocketLink } from 'apollo-link-ws'
import { SubscriptionClient } from 'subscriptions-transport-ws'

import populate from './populate'
import typeDefs from '../src/typeDefs/index'
import resolvers from '../src/resolvers'
import { setNetwork } from '../src/contracts'

setNetwork(process.env.NETWORK || 'test')

global.fetch = fetch

const wsClient = new SubscriptionClient('ws://localhost:4000/graphql', {}, ws)

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
  resolverValidationOptions: { requireResolversForResolveType: false }
})

const client = new ApolloClient({
  link: new WebSocketLink(wsClient),
  cache: new InMemoryCache()
})

const server = new ApolloServer({ schema })

client.defaultOptions = {
  watchQuery: { fetchPolicy: 'network-only' },
  query: { fetchPolicy: 'network-only' }
}

server.listen({ port: 4000 }).then(srv => {
  console.log(`🚀  Populate GraphQL server ready at ${srv.url}`)
  populate(client, console.log, async addresses => {
    const output = process.argv[2] || 'contracts'
    try {
      const path = `${__dirname}/../../contracts/build/${output}.json`
      console.log(`Writing addresses to ${path}`)
      const json = JSON.stringify(addresses, null, 4)
      fs.writeFileSync(path, json)
    } catch (e) {
      console.log('Could not write contracts.json')
    }
    await wsClient.close()
    server.httpServer.close()
    server.subscriptionServer.close()
    process.exit()
  })
})
