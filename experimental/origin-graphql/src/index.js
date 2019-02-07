import ApolloClient from 'apollo-client'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { getLink } from './link'
import metaMaskSync from './metaMaskSync'
import messagingSync from './messagingSync'
import fragmentMatcher from './typeDefs/fragmentTypes'

export function createClient({ stateLinkOpts = null } = {}) {
  const cache = new InMemoryCache({ fragmentMatcher })
  const client = new ApolloClient({
    link: getLink(stateLinkOpts, cache),
    cache
  })

  if (typeof window !== 'undefined') {
    metaMaskSync(client)
    messagingSync(client)
    window.gql = client
  }

  return client
}
