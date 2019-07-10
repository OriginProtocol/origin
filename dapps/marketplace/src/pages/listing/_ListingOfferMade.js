import React from 'react'
import { fbt } from 'fbt-runtime'

import Link from 'components/Link'
import Price from 'components/Price'

import withNetwork from 'hoc/withNetwork'

import { getOriginOfferId } from '@origin/graphql/src/utils/getId'

const OfferMade = ({ listing, offers, networkId }) => (
  <div className="listing-buy">
    <div className="price">
      <Price listing={listing} descriptor />
    </div>
    <div className="status">
      <div className="status-title">
        <fbt desc="Pending">Pending</fbt>
      </div>
      <div className="status-text">
        <fbt desc="UnitListing.offerMadeByYou">
          You have made an offer on this listing
        </fbt>
      </div>
      {offers.length > 1 && (
        <Link className="listing-action-link" to={{
          pathname: '/my-purchases',
          state: {
            canGoBack: true
          }
        }}>
          <fbt desc="viewAllOffers">View all my offers</fbt>
        </Link>
      )}
      {offers.length === 1 && (
        <Link
          className="listing-action-link"
          to={`/purchases/${getOriginOfferId(networkId, offers[0])}`}
        >
          <fbt desc="viewMyOffer">View offer</fbt>
        </Link>
      )}
    </div>
  </div>
)

export default withNetwork(OfferMade)
