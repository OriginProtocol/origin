import React from 'react'
import { Query } from 'react-apollo'
import get from 'lodash/get'
import { fbt } from 'fbt-runtime'

import query from 'queries/DecryptOutOfBandMessage'

const ShippingAddress = ({ offer }) => {
  return (
    <Query
      query={query}
      variables={{ encrypted: offer.shippingAddressEncrypted }}
      notifyOnNetworkStatusChange={true}
      fetchPolicy="no-cache"
    >
      {({ error, data }) => {
        const content = get(data, 'messaging.decryptOutOfBandMessage.content')
        if (error) {
          return (
            <fbt desc="OfferDetails.loading">
              Could not decrypt shipping address
            </fbt>
          )
        } else if (content) {
          return <span style={{ whiteSpace: 'pre' }}>{content}</span>
        } else {
          return <fbt desc="OfferDetails.loading">Loading</fbt>
        }
      }}
    </Query>
  )
}

export default ShippingAddress
