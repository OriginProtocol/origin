import React from 'react'
import Link from 'components/Link'

import { fbt } from 'fbt-runtime'

const HistoricalListingWarning = ({ listingId }) => (
  <>
    <div className="historical-warning">
      <fbt desc="listingDetail.view-current-listing">
        A newer version of this listing has been published
      </fbt>
    </div>
    <Link to={`/listing/${listingId}`} className="btn btn-primary">
      <fbt desc="listingDetail.view-current-listing">View Current Listing</fbt>
    </Link>
  </>
)

export default HistoricalListingWarning

require('react-styl')(`
  .historical-warning
    border-radius: 0.625rem
    border: solid 1px #ffc000
    background-color: rgba(255, 192, 0, 0.1)
    padding: 0.75rem 1.25rem
    margin-bottom: 2rem
`)
