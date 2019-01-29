import ApolloClient from 'apollo-client'
import { InMemoryCache } from 'apollo-cache-inmemory'
import link from './link'
import metaMaskSync from './metaMaskSync'
import messagingSync from './messagingSync'
import fragmentMatcher from './typeDefs/fragmentTypes'

const cache = new InMemoryCache({ fragmentMatcher })
const client = new ApolloClient({ link, cache })

if (typeof window !== 'undefined') {
  metaMaskSync(client)
  messagingSync(client)
  window.gql = client
}

export default client
