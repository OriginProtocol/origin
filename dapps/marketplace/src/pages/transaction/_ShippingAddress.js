import React from 'react'
import { Query } from 'react-apollo'
import get from 'lodash/get'
import { fbt } from 'fbt-runtime'

import query from 'queries/DecryptShippingAddress'

const ShippingAddress = ({ offer }) => {
  return (
    <Query
      query={query}
      variables={{ encrypted: offer.shippingAddressEncrypted }}
      notifyOnNetworkStatusChange={true}
      fetchPolicy="no-cache"
    >
      {({ error, data }) => {
        const ship = get(data, 'messaging.decryptShippingAddress')
        if (error) {
          return (
            <fbt desc="OfferDetails.loading">
              Could not decrypt shipping address
            </fbt>
          )
        } else if (ship) {
          return (
            <div>
              <div>{ship.name}</div>
              <div>{ship.address1}</div>
              <div>{ship.address2}</div>
              <div>
                {ship.city}, {ship.stateProvinceRegion} {ship.postalCode}
              </div>
              <div>{ship.country}</div>
            </div>
          )
        } else {
          return <fbt desc="OfferDetails.loading">Loading</fbt>
        }
      }}
    </Query>
  )
}

export default ShippingAddress
