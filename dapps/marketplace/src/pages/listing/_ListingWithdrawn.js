import React from 'react'
import { fbt } from 'fbt-runtime'

import Link from 'components/Link'
import Price from 'components/Price'

const Withdrawn = ({ listing }) => (
  <div className="listing-buy">
    <div className="price">
      <Price listing={listing} descriptor />
    </div>
    <div className="status">
      <div className="status-title">
        <fbt desc="Unavailable">Unavailable</fbt>
      </div>
      <div className="status-text">
        <fbt desc="UnavailableListing">
          This listing is unavailable at the moment
        </fbt>
      </div>
      <Link className="listing-action-link" to="/listings">
        <fbt desc="viewAllListings">View all listings</fbt>
      </Link>
    </div>
  </div>
)

export default Withdrawn
