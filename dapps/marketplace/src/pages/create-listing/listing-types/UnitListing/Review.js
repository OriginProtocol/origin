import React from 'react'
import { fbt } from 'fbt-runtime'

import Price from 'components/Price'
import GalleryScroll from 'components/GalleryScroll'
import Category from 'components/Category'
import FormattedDescription from 'components/FormattedDescription'

import Review from '../../Review'

const ReviewUnitListing = props => {
  // const quantity = Number(listing.quantity || 0)
  const listing = props.listing
  return (
    <Review {...props}>
      <div className="listing-review">
        <div className="title">{listing.title}</div>
        <div className="price-quantity">
          <div className="price">
            <Price
              target={listing.currency}
              price={{
                amount: listing.price,
                currency: { id: listing.currency }
              }}
            />
          </div>
          <div>
            <fbt desc="create.review.quantity">
              Quantity:
              <fbt:param name="quantity">{listing.quantity}</fbt:param>
            </fbt>
          </div>
        </div>
        <GalleryScroll pics={listing.media} />
        <div className="description">
          <FormattedDescription text={listing.description} />
        </div>
        <dl>
          <dt>
            <fbt desc="create.review.category">Category</fbt>
          </dt>
          <dd>
            <Category listing={listing} />
          </dd>
        </dl>
      </div>
    </Review>
  )
}

export default ReviewUnitListing
