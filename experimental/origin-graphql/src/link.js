import { ApolloLink } from 'apollo-link'
import { getMainDefinition } from 'apollo-utilities'
import { withClientState } from 'apollo-link-state'

import './contracts'
import SchemaLink from './links/schemaLink'
import SubscriptionsLink from './links/SubscriptionsLink'

export function getLink(stateLinkOpts = null, cache = null) {
  const link = ApolloLink.split(
    operation => {
      const definition = getMainDefinition(operation.query)
      return definition.operation === 'subscription'
    },
    new SubscriptionsLink(),
    SchemaLink
  )

  if (stateLinkOpts === null || cache === null)
    return link

  const stateLink = withClientState({
    cache,
    resolvers: stateLinkOpts.resolvers,
    defaults: stateLinkOpts.defaults || {}
  })

  return ApolloLink.from([stateLink, link])
}
