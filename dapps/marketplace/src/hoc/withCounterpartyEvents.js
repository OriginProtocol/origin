import React from 'react'
import { useQuery } from '@apollo/react-hooks'
import get from 'lodash/get'

import CounterpartyEventsQuery from 'queries/CounterpartyEventsQuery'

function withCounterpartyEvents(WrappedComponent) {
  const WithCounterpartyEvents = props => {
    const { data, loading } = useQuery(CounterpartyEventsQuery, {
      variables: { user: props.walletProxy, counterparty: props.id },
      skip: !props.wallet || !props.id
    })
    return (
      <WrappedComponent
        {...props}
        counterpartyEventsLoading={loading}
        counterpartyEvents={
          loading ? [] : get(data, 'marketplace.user.counterparty.nodes', [])
        }
      />
    )
  }
  return WithCounterpartyEvents
}

export default withCounterpartyEvents
