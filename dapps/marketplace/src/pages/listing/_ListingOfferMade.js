import React from 'react'
import { fbt } from 'fbt-runtime'

import Link from 'components/Link'
import Price from 'components/Price'

const OfferMade = ({ listing, offers }) => (
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
        <Link className="listing-action-link" to="/my-purchases">
          <fbt desc="viewAllOffers">View all my offers</fbt>
        </Link>
      )}
      {offers.length === 1 && (
        <Link className="listing-action-link" to="/my-purchases">
          <fbt desc="viewMyOffer">View offer</fbt>
        </Link>
      )}
    </div>
  </div>
)

export default OfferMade
