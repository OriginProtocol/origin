import React from 'react'
import Link from 'components/Link'
import { currentListingIdFromHistoricalId } from 'utils/listing'

import Price from 'components/Price'

import { fbt } from 'fbt-runtime'

const HistoricalListingWarning = ({ listing }) => (
  <>
    <div className="listing-buy">
      <div className="price">
        <Price listing={listing} descriptor />
      </div>
    </div>
    <div className="historical-warning-container">
      <div className="historical-warning">
        <fbt desc="listingDetail.view-current-listing">
          A newer version of this listing has been published
        </fbt>
      </div>
      <Link
        to={`/listing/${currentListingIdFromHistoricalId(listing)}`}
        className="btn btn-primary btn-block btn-rounded"
      >
        <fbt desc="listingDetail.view-current-listing">
          View Current Listing
        </fbt>
      </Link>
    </div>
  </>
)

export default HistoricalListingWarning

require('react-styl')(`
  .historical-warning-container
    margin-bottom: 2rem
    padding: 0 0 2rem 0
    border-bottom: 1px solid #dde6ea
    .historical-warning
      border-radius: 0.625rem
      border: solid 1px #ffc000
      background-color: rgba(255, 192, 0, 0.1)
      padding: 0.75rem 1.25rem
      margin-bottom: 2rem
    .btn
      padding: 0.75rem
`)
