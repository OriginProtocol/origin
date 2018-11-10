import { ApolloLink } from 'apollo-link'
import { getMainDefinition } from 'apollo-utilities'

import config from './contracts'
import SchemaLink from './links/SchemaLink'
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
