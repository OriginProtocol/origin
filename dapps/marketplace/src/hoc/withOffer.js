import React from 'react'
import { useQuery } from '@apollo/react-hooks'
import get from 'lodash/get'

import OfferQuery from 'queries/Offer'

function withOffer(WrappedComponent, offerProp = 'offerId') {
  const WithOffer = props => {
    const offerId = get(props, offerProp, null)

    const { networkStatus, error, data, refetch } = useQuery(OfferQuery, {
      skip: !offerId,
      variables: { offerId },
      notifyOnNetworkStatusChange: true,
      fetchPolicy: 'cache-first'
    })

    const offer = get(data, 'marketplace.offer')
    return (
      <WrappedComponent
        {...props}
        offer={offer}
        refetchOffer={refetch}
        offerLoading={networkStatus === 1}
        offerError={error}
      />
    )
  }
  return WithOffer
}

export default withOffer
