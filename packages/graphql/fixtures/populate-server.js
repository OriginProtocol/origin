import fetch from 'node-fetch'
import ws from 'ws'
// import wtfnode from 'wtfnode'

import server from '../server'

import ApolloClient from 'apollo-client'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { WebSocketLink } from 'apollo-link-ws'
import { SubscriptionClient } from 'subscriptions-transport-ws'

import populate from './populate'

global.fetch = fetch

const wsClient = new SubscriptionClient('ws://localhost:4000/graphql', {}, ws)

const client = new ApolloClient({
  link: new WebSocketLink(wsClient),
  cache: new InMemoryCache()
})

client.defaultOptions = {
  watchQuery: { fetchPolicy: 'network-only' },
  query: { fetchPolicy: 'network-only' }
}

server.listen().then((srv) => {
  console.log(`🚀  Server ready at ${srv.url}`)
  populate(
    client,
    console.log,
    async addresses => {
      console.log(addresses)
      await wsClient.close()
      server.httpServer.close()
      server.subscriptionServer.close()
      server.shutdown()
    }
  )
})
