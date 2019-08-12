import React from 'react'
import { Query } from 'react-apollo'
import get from 'lodash/get'

import ListingQuery from 'queries/Listing'

function withListing(WrappedComponent) {
  const WithListing = props => {
    const listingId = props.match.params.listingID
    return (
      <Query query={ListingQuery} skip={!listingId} variables={{ listingId }}>
        {({ networkStatus, error, data, refetch }) => {
          const listing = get(data, 'marketplace.listing')
          return (
            <WrappedComponent
              {...props}
              {...{ networkStatus, error, listing }}
              refetchListing={refetch}
            />
          )
        }}
      </Query>
    )
  }
  return WithListing
}

export default withListing
