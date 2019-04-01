import ApolloClient from 'apollo-client'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { createHttpLink } from 'apollo-link-http'

const link = createHttpLink({ uri: 'http://localhost:4000/graphql' })

const client = new ApolloClient({ link, cache: new InMemoryCache() })

window.gql = client

export default client
