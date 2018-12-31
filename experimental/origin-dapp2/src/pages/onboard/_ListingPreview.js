import React from 'react'
import Price from 'components/Price'
import { getIpfsGateway } from 'utils/config'

const ListingPreview = ({ listing }) => {
  const ipfsGateway = getIpfsGateway()
  return (
    <div className="listing-preview">
      <h4>Your listing is waiting...</h4>
      <div className="listing-card">
        {listing.media && listing.media.length ? (
          <div
            className="main-pic"
            style={{
              backgroundImage: `url(${ipfsGateway}/${listing.media[0].url.replace(
                ':/',
                ''
              )})`
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
