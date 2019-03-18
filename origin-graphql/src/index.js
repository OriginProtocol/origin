import ApolloClient from 'apollo-client'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { setContext } from 'apollo-link-context'
import link from './link'
import metaMaskSync from './metaMaskSync'
import messagingSync from './messagingSync'
import fragmentMatcher from './typeDefs/fragmentTypes'

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('loggedInAs')
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : ''
    }
  }
})
const cache = new InMemoryCache({ fragmentMatcher })
const client = new ApolloClient({ link: authLink.concat(link), cache })

if (typeof window !== 'undefined') {
  metaMaskSync(client)
  messagingSync(client)
  window.gql = client
}

export default client
