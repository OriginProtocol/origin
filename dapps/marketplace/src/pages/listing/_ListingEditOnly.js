import React from 'react'

import Link from 'components/Link'
import Price from 'components/Price'

const EditOnly = ({
  listing,
  isAnnouncement,
  isFractional,
  isFractionalHourly
}) => (
  <div className="listing-buy">
    {isAnnouncement ? null : (
      <div className="price">
        <Price listing={listing} descriptor />
      </div>
    )}
    {isFractional || isFractionalHourly || isAnnouncement ? null : (
      <div className="listing-buy-editonly">
        <div className="row">
          <div>Sold</div>
          <div>{listing.unitsSold}</div>
        </div>
        <div className="row">
          <div>Pending</div>
          <div>{listing.unitsPending}</div>
        </div>
        <div className="row">
          <div>Available</div>
          <div>{listing.unitsAvailable}</div>
        </div>
      </div>
    )}
    <Link
      className="btn btn-primary mt-2"
      to={`/listing/${listing.id}/edit`}
      children={'Edit Listing'}
    />
  </div>
)

export default EditOnly

require('react-styl')(`
  .listing-buy
    .listing-buy-editonly
      border-top: 1px solid var(--light)
      border-bottom: 1px solid var(--light)
      padding: 1rem
      margin-bottom: 1rem
      .row
        div:nth-child(1)
          flex: 1
          padding-left: 1rem
        div:nth-child(2)
          flex: 1
          text-align: right
          padding-right: 1rem
`)
