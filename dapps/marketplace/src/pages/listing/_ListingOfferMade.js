import React from 'react'

import Link from 'components/Link'

const OfferMade = () => (
  <div className="listing-buy pending">
    <div>This listing is</div>
    <div>Pending</div>
    <div>You have already made an offer on this listing.</div>
    <Link to="/my-purchases">View My Purchases</Link>
  </div>
)

export default OfferMade
