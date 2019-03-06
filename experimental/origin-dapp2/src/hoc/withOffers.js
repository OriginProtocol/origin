import React from 'react'
import { Query } from 'react-apollo'
import get from 'lodash/get'
import pick from 'lodash/pick'
import isNil from 'lodash/isNil'
import flatten from 'lodash/flatten'

import SalesQuery from 'queries/Sales'
import eventKeys from 'constants/offerEvents'

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
            const offerProps = pick(offer, [
              'offerId',
              'listing',
              'buyer',
              'withdrawnBy'
            ])

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
                    ...offerProps
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
