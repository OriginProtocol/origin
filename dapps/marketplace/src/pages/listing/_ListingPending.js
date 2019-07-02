import React from 'react'
import { fbt } from 'fbt-runtime'

import Link from 'components/Link'
import Price from 'components/Price'

const Pending = ({ listing, isMobile }) => (
  <div className="listing-buy">
    <div className="price">
      <Price listing={listing} descriptor />
    </div>
    <div className="status">
      <div className="status-title">
        <fbt desc="Pending">Pending</fbt>
      </div>
      <div className="status-text">
        {!isMobile ? (
          <fbt desc="UnitListing.anotherOfferMade">
            Another buyer has made an offer on this listing.
          </fbt>
        ) : (
          <fbt desc="UnitListing.offerMadeOnListing">
            An offer has been made on this listing
          </fbt>
        )}
      </div>
      <Link className="listing-action-link" to="/listings">
        <fbt desc="viewAllListings">View all listings</fbt>
      </Link>
    </div>
  </div>
)

export default Pending
