import React from 'react'
import { fbt } from 'fbt-runtime'

import Price from 'components/Price'
import GalleryScroll from 'components/GalleryScroll'
import Category from 'components/Category'
import FormattedDescription from 'components/FormattedDescription'

import Review from '../../Review'

const ReviewFractionalListing = props => {
  const listing = props.listing
  return (
    <Review {...props}>
      <div className="listing-review">
        <div className="title">{listing.title}</div>
        <div className="price-quantity">
          <div className="price">
            <Price
              listing={listing}
              target={listing.currency}
              descriptor
              price={{
                amount: listing.price,
                currency: { id: listing.currency }
              }}
            />
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
            <Category listing={listing} showPrimary={false} />
          </dd>
          <dt>
            <fbt desc="listing.review.weekends">Weekends</fbt>
          </dt>
          <dd>
            <Price
              listing={listing}
              target={listing.currency}
              descriptor
              price={{
                amount: listing.weekendPrice,
                currency: { id: listing.currency }
              }}
            />
          </dd>
        </dl>
      </div>
    </Review>
  )
}

export default ReviewFractionalListing
