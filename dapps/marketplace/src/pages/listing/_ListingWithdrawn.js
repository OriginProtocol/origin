import React from 'react'
import { fbt } from 'fbt-runtime'

import Link from 'components/Link'

const Withdrawn = () => (
  <div className="listing-buy pending">
    <fbt desc="listingWithdrawn.text">
      <div>This listing is</div>
      <div>Unavailable</div>
    </fbt>
    <Link to="/listings">
      <fbt desc="viewListings">View Listings</fbt>
    </Link>
  </div>
)

export default Withdrawn
