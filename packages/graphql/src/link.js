import Observable from 'zen-observable'
import { ApolloLink } from 'apollo-link'
import { getMainDefinition } from 'apollo-utilities'

import context from './contracts'
import schemaLink from './links/schemaLink'
import remoteSchemaLink from './links/remoteSchemaLink'
import SubscriptionsLink from './links/SubscriptionsLink'

const subscriptionLink = new SubscriptionsLink()

/**
 * Making decisions on what to send the query to.  Either the subscription
 * link combined local+remote, or local-only.  The `Observable.of()` addition
 * shamelessly stolen from ApolloLink.split source
 */
const link = new ApolloLink(operation => {
  const definition = getMainDefinition(operation.query)
  if (definition.operation === 'subscription') {
    return subscriptionLink.request(operation) || Observable.of()
  } else if (context && context.config && context.config.performanceMode) {
    return remoteSchemaLink.request(operation) || Observable.of()
  } else {
    return schemaLink.request(operation) || Observable.of()
  }
})

export default link
