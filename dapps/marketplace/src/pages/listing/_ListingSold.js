import React from 'react'
import { fbt } from 'fbt-runtime'

import Link from 'components/Link'
import Price from 'components/Price'

const Sold = ({ listing, isSingleUnit }) => (
  <div className="listing-buy">
    <div className="price">
      <Price listing={listing} descriptor />
    </div>
    <div className="status">
      <div className={`status-title${isSingleUnit ? '' : ' red'}`}>
        {isSingleUnit ? fbt('Sold', 'Sold') : fbt('Sold Out', 'SoldOut')}
      </div>
      <div className="status-text">
        {!isSingleUnit
          ? fbt(
              'This listing is no longer available.',
              'MultiUnitListing.soldOut'
            )
          : fbt(
              'Another buyer has purchased this listing.',
              'UnitListing.soldOut'
            )}
      </div>
    </div>
    <Link className="listing-action-link" to="/listings">
      <fbt desc="viewAllListings">View all listings</fbt>
    </Link>
  </div>
)

export default Sold

require('react-styl')(`
  .listing-buy
    .status
      margin-top: 1rem
      .status-title
        font-weight: 900
        font-size: 18px
        &.red
          color: red
      .status-text
        font-size: 16px
`)
