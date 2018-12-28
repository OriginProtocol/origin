import ApolloClient from 'apollo-client'
import { InMemoryCache } from 'apollo-cache-inmemory'
import link from './link'
import metaMaskSync from './metaMaskSync'
import messagingSync from './messagingSync'
// import { persistCache } from 'apollo-cache-persist'

const cache = new InMemoryCache()
// persistCache({ cache, storage: window.localStorage })

const client = new ApolloClient({ link, cache })
metaMaskSync(client)
messagingSync(client)

window.gql = client

export default client
