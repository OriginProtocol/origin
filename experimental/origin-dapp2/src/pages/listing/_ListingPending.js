import React from 'react'

import Link from 'components/Link'

const Pending = () => (
  <div className="listing-buy pending">
    <div>This listing is</div>
    <div>Pending</div>
    <div>
      Another buyer has already made an offer on this listing. Try visiting the
      listings page and searching for something similar.
    </div>
    <Link to="/listings">View Listings</Link>
  </div>
)

export default Pending
