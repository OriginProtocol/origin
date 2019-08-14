import React from 'react'
import { useQuery } from '@apollo/react-hooks'
import get from 'lodash/get'

import ListingQuery from 'queries/Listing'

function withListing(WrappedComponent) {
  const WithListing = props => {
    const listingId = props.match.params.listingID
    const { networkStatus, error, data, refetch } = useQuery(ListingQuery, {
      skip: !listingId,
      variables: { listingId }
    })
    const listing = get(data, 'marketplace.listing')
    return (
      <WrappedComponent
        {...props}
        {...{ networkStatus, error, listing }}
        refetchListing={refetch}
      />
    )
  }
  return WithListing
}

export default withListing
