import Observable from 'zen-observable'
import { ApolloLink } from 'apollo-link'
import { getMainDefinition } from 'apollo-utilities'

import context from './contracts'
import schemaLink from './links/schemaLink'
import remoteSchemaLink from './links/remoteSchemaLink'
import SubscriptionsLink from './links/SubscriptionsLink'

/**
 * Making decisions on whwat to send the query to.  Either the subscription
 * link remote, or local.  The `Observable.of()` addition shamelessly stolen
 * from ApolloLink.split source
 */
const link = new ApolloLink(operation => {
  const subscriptionLink = new SubscriptionsLink()
  const definition = getMainDefinition(operation.query)
  if (definition.operation === 'subscription') {
    return subscriptionLink.request(operation) || Observable.of()
  } else if (context.config.performanceMode) {
    return remoteSchemaLink.request(operation) || Observable.of()
  } else {
    return schemaLink.request(operation) || Observable.of()
  }
})

export default link
