import React from 'react'

import Link from 'components/Link'
import Price from 'components/Price'

const EditOnly = ({ listing, isAnnouncement }) => (
  <div className="listing-buy">
    {isAnnouncement ? null : (
      <div className="price">
        <div className="eth">{`${listing.price.amount} ETH`}</div>
        <div className="usd">
          <Price amount={listing.price.amount} />
        </div>
      </div>
    )}
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
      border-top: 1px solid var(--dark)
      border-bottom: 1px solid var(--dark)
      padding: 16px
      margin-bottom: 16px
      .row
        div:nth-child(1)
          width: auto
          flex: 1
          padding-left: 16px
        div:nth-child(2)
          flex: 1
          text-align: right
          padding-right: 16px
`)
