import React from 'react'
import { fbt } from 'fbt-runtime'

import Price from 'components/Price'

const ListingPreview = ({ listing }) => {
  if (!listing) return null
  return (
    <div className="listing-preview">
      <h4><fbt desc="onboard.ListingPreview.listingWaiting">Your listing is waiting...</fbt></h4>
      <div className="listing-card">
        {listing.media && listing.media.length ? (
          <div
            className="main-pic"
            style={{
              backgroundImage: `url(${listing.media[0].urlExpanded})`
            }}
          />
        ) : null}
        <div className="category">{listing.categoryStr}</div>
        <h5>{listing.title}</h5>
        <div className="price">
          <div className="eth">{`${listing.price.amount} ETH`}</div>
          <div className="usd">
            <Price amount={listing.price.amount} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default ListingPreview
