import React from 'react'

import Link from 'components/Link'

const Sold = () => (
  <div className="listing-buy pending">
    <div>This listing is</div>
    <div>Sold</div>
    <div>
      This listing is sold out. Try visiting the listings page and searching for
      something similar.
    </div>
    <Link to="/listings">View Listings</Link>
  </div>
)

export default Sold
