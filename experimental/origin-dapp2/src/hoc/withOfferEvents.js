import React from 'react'
import { Query } from 'react-apollo'
import get from 'lodash/get'

import PurchaseQuery from 'queries/Purchases'

function withOfferEvents(WrappedComponent, walletProp = 'wallet') {
  const WithOfferEvents = props => {
    const id = get(props, walletProp)
    // console.log("IS THERE AN ID", id)
    if (!id) {
      return <WrappedComponent {...props} />
    }
    return (
      <Query query={PurchaseQuery} variables={{ id, filter: 'pending' }}>
        {({ data, refetch }) => {
          const offers = get(data, 'marketplace.user.offers.nodes', [])
          return (
            <WrappedComponent
              {...props}
              offers={offers}
            />
          )
        }}
      </Query>
    )
  }
  return WithOfferEvents
}

export default withOfferEvents
