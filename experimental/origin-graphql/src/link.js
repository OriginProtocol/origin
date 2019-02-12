import { ApolloLink } from 'apollo-link'
import { getMainDefinition } from 'apollo-utilities'

import './contracts'
import SchemaLink from './links/schemaLink'
import SubscriptionsLink from './links/SubscriptionsLink'

const link = ApolloLink.split(
  operation => {
    const definition = getMainDefinition(operation.query)
    return definition.operation === 'subscription'
  },
  new SubscriptionsLink(),
  SchemaLink
)

export default link
