import React from 'react'
import { fbt } from 'fbt-runtime'

import Link from 'components/Link'

const Pending = () => (
  <div className="listing-buy pending">
    <fbt desc="listingPending.text">
      <div>This listing is</div>
      <div>Pending</div>
      <div>
        Another buyer has already made an offer on this listing. Try visiting
        the listings page and searching for something similar.
      </div>
    </fbt>
    <Link to="/listings">
      <fbt desc="viewListings">View Listings</fbt>
    </Link>
  </div>
)

export default Pending
