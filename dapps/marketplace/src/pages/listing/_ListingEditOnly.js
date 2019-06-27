import React from 'react'
import { fbt } from 'fbt-runtime'

import Link from 'components/Link'
import Price from 'components/Price'

const EditOnly = ({
  listing,
  isAnnouncement,
  isFractional,
  isFractionalHourly,
  isSingleUnit
}) => (
  <div className="listing-buy">
    {isAnnouncement ? null : (
      <div className="price">
        <Price listing={listing} descriptor />
      </div>
    )}
    {isFractional ||
    isFractionalHourly ||
    isAnnouncement ||
    isSingleUnit ? null : (
      <div className="listing-buy-editonly">
        <div className="row">
          <div>
            <fbt desc="number of units that have been sold">Sold</fbt>
          </div>
          <div>{listing.unitsSold}</div>
        </div>
        <div className="row">
          <div>
            <fbt desc="number of units whose transaction are pending">
              Pending
            </fbt>
          </div>
          <div>{listing.unitsPending}</div>
        </div>
        <div className="row">
          <div>
            <fbt desc="number of units available">Available</fbt>
          </div>
          <div>{listing.unitsAvailable}</div>
        </div>
      </div>
    )}
    <Link
      className="listing-action-link"
      to={`/listing/${listing.id}/edit`}
      children={fbt('Edit listing', 'EditListing')}
    />
  </div>
)

export default EditOnly

require('react-styl')(`
  .listing-buy
    .listing-buy-editonly
      padding: 1rem 0 0 0
      .row
        margin-bottom: 1rem
        &:last-child
          margin-bottom: 0
        > div:nth-child(1)
          flex: 1
          padding-left: 1rem
        > div:nth-child(2)
          flex: 1
          text-align: right
          padding-right: 1rem
          font-weight: bold
    .listing-action-link
      font-size: 16px
      margin-top: 1rem
      display: inline-block
      &:after
        content: '>'
        margin-left: 0.5rem
        display: inline-block
`)
