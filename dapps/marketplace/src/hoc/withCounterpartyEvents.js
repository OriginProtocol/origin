import React from 'react'
import { Query } from 'react-apollo'
import get from 'lodash/get'

import CounterpartyEventsQuery from 'queries/CounterpartyEventsQuery'

function withCounterpartyEvents(WrappedComponent) {
  const WithCounterpartyEvents = props => {
    return (
      <Query
        query={CounterpartyEventsQuery}
        variables={{ user: props.wallet, counterparty: props.id }}
        skip={!props.wallet || !props.id}
      >
        {({ data, loading }) => {
          return (
            <WrappedComponent
              {...props}
              counterpartyEventsLoading={loading}
              counterpartyEvents={
                loading
                  ? []
                  : get(data, 'marketplace.user.counterparty.nodes', [])
              }
            />
          )
        }}
      </Query>
    )
  }
  return WithCounterpartyEvents
}

export default withCounterpartyEvents
