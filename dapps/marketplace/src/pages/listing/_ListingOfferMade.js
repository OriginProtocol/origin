import React from 'react'
import { fbt } from 'fbt-runtime'

import Link from 'components/Link'

const OfferMade = () => (
  <div className="listing-buy pending">
    <fbt desc="listingOfferMade.text">
      <div>This listing is</div>
      <div>Pending</div>
      <div>You have already made an offer on this listing.</div>
    </fbt>
    <Link to="/my-purchases">
      <fbt desc="listingOfferMade.viewPurchasesLink">View My Purchases</fbt>
    </Link>
  </div>
)

export default OfferMade
