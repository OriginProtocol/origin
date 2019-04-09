import React from 'react'

import Price from 'components/Price'
import Category from 'components/Category'

const ListingDetail = ({ listing }) => (
  <div className="tx-listing-detail">
    {listing.media && listing.media.length ? (
      <div
        className="main-pic"
        style={{
          backgroundImage: `url(${listing.media[0].urlExpanded})`
        }}
      />
    ) : null}
    <div>
      <h5 className="mb-0">{listing.title}</h5>
      <div className="category mb-2">
        <Category listing={listing} />
      </div>
      <div className="price">
        <Price price={listing.price} />
      </div>
    </div>
  </div>
)

export default ListingDetail

require('react-styl')(`
  .tx-listing-detail
    border: 1px solid var(--light)
    border-radius: var(--default-radius)
    padding: 1rem
    display: flex
    margin-bottom: 2rem
    .main-pic
      width: 200px
      min-height: 150px
      background-size: contain;
      background-repeat: no-repeat
      background-position: center top
      margin-right: 1rem;
    .category
      font-size: 14px
    .fiat
      display: inline-block
      margin-left: 0.75rem
      font-size: 14px

`)
