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
      <div className="status-title sold-out">
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
      <Link className="listing-action-link" to="/listings">
        <fbt desc="viewAllListings">View all listings</fbt>
      </Link>
    </div>
  </div>
)

export default Sold

require('react-styl')(`
  .listing-buy
    .status
      text-align: center
      padding: 1.25rem
      background-color: #f3f7f9
      border: solid 1px #eaf0f3
      border-radius: 10px
      margin-bottom: 0.5rem
      .status-title
        font-weight: 900
        font-size: 18px
        &.sold-out
          color: red
      .status-text
        font-size: 16px
    .listing-action-link
      font-size: 18px
      margin-top: 0.75rem
      display: inline-block
      &:after
        content: '>'
        margin-left: 0.5rem
        display: inline-block
  @media (max-width: 767.98px)
    .listing-buy .status
      margin-left: -15px
      margin-right: -15px
      border-radius: 0

`)
