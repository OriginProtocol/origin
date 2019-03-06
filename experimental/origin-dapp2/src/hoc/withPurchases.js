import React from 'react'
import { Query } from 'react-apollo'
import get from 'lodash/get'
import pick from 'lodash/pick'
import isNil from 'lodash/isNil'
import flatten from 'lodash/flatten'

import PurchaseQuery from 'queries/Purchases'
import eventKeys from 'constants/offerEvents'

function withOfferEvents(WrappedComponent, walletProp = 'wallet') {
  const WithOfferEvents = props => {
    const id = get(props, walletProp)
    if (!id) {
      return <WrappedComponent {...props} />
    }

    return (
      <Query query={PurchaseQuery} variables={{ id }}>
        {({ data }) => {
          const purchases = get(data, 'marketplace.user.offers.nodes', [])
          const updatedPurchaseEvents = purchases.map(purchase => {
            const purchaseEvents = pick(purchase, eventKeys)
            const purchaseProps = pick(purchase, [
              'offerId',
              'listing',
              'buyer',
              'withdrawnBy'
            ])

            return Object.keys(purchaseEvents).reduce((result, value) => {
              if (
                eventKeys.find(key => key === value) &&
                !isNil(purchaseEvents[value])
              )
                return [
                  ...result,
                  {
                    offerEvent: purchaseEvents[value],
                    offerTitle: value,
                    ...purchaseProps
                  }
                ]
              return result
            }, [])
          })

          return (
            <WrappedComponent
              {...props}
              purchases={purchases}
              purchaseEvents={flatten(updatedPurchaseEvents)}
            />
          )
        }}
      </Query>
    )
  }
  return WithOfferEvents
}

export default withOfferEvents
