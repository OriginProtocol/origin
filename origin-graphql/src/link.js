import { ApolloLink } from 'apollo-link'
import { createHttpLink } from 'apollo-link-http'
import { getMainDefinition } from 'apollo-utilities'

import './contracts'
import SchemaLink from './links/schemaLink'
import SubscriptionsLink from './links/SubscriptionsLink'

const HOST = process.env.HOST
const httpLink = createHttpLink({ uri: `http://${HOST}:4000/graphql` })

const serverLink = ApolloLink.split(
  operation => {
    if (!localStorage.loggedInAs) return false
    const definition = getMainDefinition(operation.query)
    return definition.operation === 'mutation'
  },
  httpLink,
  SchemaLink
)

const link = ApolloLink.split(
  operation => {
    const definition = getMainDefinition(operation.query)
    return definition.operation === 'subscription'
  },
  new SubscriptionsLink(),
  serverLink
)

export default link
