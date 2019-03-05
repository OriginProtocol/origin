import React from 'react'
import { Query } from 'react-apollo'
import get from 'lodash/get'
import pick from 'lodash/pick'
import find from 'lodash/find'
import isNil from 'lodash/isNil'
import flatten from 'lodash/flatten'

import PurchaseQuery from 'queries/Purchases'
import SalesQuery from 'queries/Sales'

const eventKeys = [
  'createdEvent',
  'acceptedEvent',
  'disputedEvent',
  'rulingEvent',
  'finalizedEvent'
]
function withOffers(WrappedComponent, walletProp = 'wallet') {
  const WithOffers = props => {
    const id = get(props, walletProp)
    if (!id) {
      return <WrappedComponent {...props} />
    }

    return (
      <Query query={SalesQuery} variables={{ id }}>
        {({ data }) => {
          const offers = get(data, 'marketplace.user.sales.nodes', [])

          const updatedOfferEvents = offers.map(offer => {
            const offerEvents = pick(offer, eventKeys)
            const offerProps = pick(offer, ['offerId', 'listing', 'buyer'])

            return Object.keys(offerEvents).reduce((result, value) => {
              if (
                eventKeys.find(key => key === value) &&
                !isNil(offerEvents[value])
              )
                return [
                  ...result,
                  {
                    offerEvent: offerEvents[value],
                    offerTitle: value,
                    ...offerProps,
                    address: get(offer, 'listing.seller.id')
                  }
                ]
              return result
            }, [])
          })

          return (
            <WrappedComponent
              {...props}
              offers={offers}
              offerEvents={flatten(updatedOfferEvents)}
            />
          )
        }}
      </Query>
    )
  }
  return WithOffers
}

export default withOffers
