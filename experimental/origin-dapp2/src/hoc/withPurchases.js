import React from 'react'
import { Query } from 'react-apollo'
import get from 'lodash/get'

import PurchaseQuery from 'queries/Purchases'

function withOfferEvents(WrappedComponent, walletProp = 'wallet') {
  const WithOfferEvents = props => {
    const id = get(props, walletProp)
    if (!id) {
      return <WrappedComponent {...props} />
    }

    return (
      <Query query={PurchaseQuery} variables={{ id }}>
        {({ data, refetch }) => {
          const purchases = get(data, 'marketplace.user.offers.nodes', [])
          return (
            <WrappedComponent
              {...props}
              purchases={purchases}
            />
          )
        }}
      </Query>
    )
  }
  return WithOfferEvents
}

export default withOfferEvents
