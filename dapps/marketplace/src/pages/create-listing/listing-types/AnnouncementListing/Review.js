import React from 'react'
import { fbt } from 'fbt-runtime'

import GalleryScroll from 'components/GalleryScroll'
import Category from 'components/Category'
import FormattedDescription from 'components/FormattedDescription'

import Review from '../../Review'

const ReviewAnnouncementListing = props => {
  const listing = props.listing
  return (
    <Review {...props}>
      <div className="listing-review">
        <div className="title">{listing.title}</div>
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

export default ReviewAnnouncementListing
