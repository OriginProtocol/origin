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
    <Link
      className="btn btn-primary mt-2"
      to={`/listing/${listing.id}/edit`}
      children={'Edit Listing'}
    />
  </div>
)

export default EditOnly
