import React from 'react'
import { fbt } from 'fbt-runtime'

import Link from 'components/Link'

const Sold = () => (
  <div className="listing-buy pending">
    <fbt desc="listingSold.text">
      <div>This listing is</div>
      <div>Sold</div>
      <div>
        This listing is sold out. Try visiting the listings page and searching
        for something similar.
      </div>
    </fbt>
    <Link to="/listings">
      <fbt desc="viewListings">View Listings</fbt>
    </Link>
  </div>
)

export default Sold
