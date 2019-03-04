import React from 'react'
import { Query } from 'react-apollo'
import get from 'lodash/get'

import PurchaseQuery from 'queries/Purchases'
import SalesQuery from 'queries/Sales'

function withOffers(WrappedComponent, walletProp = 'wallet') {
  const WithOffers = props => {
    const id = get(props, walletProp)
    if (!id) {
      return <WrappedComponent {...props} />
    }
    const query = props.isBuyer ? PurchaseQuery : SalesQuery

    return (
      <Query query={query} variables={{ id }}>
        {({ data, refetch }) => {
          const offers = get(data, 'marketplace.user.sales.nodes', [])

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
  return WithOffers
}

export default withOffers
