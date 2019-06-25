import React from 'react'
import { fbt } from 'fbt-runtime'

import Link from 'components/Link'
import Price from 'components/Price'
import GalleryScroll from 'components/GalleryScroll'
import Category from 'components/Category'
import FormattedDescription from 'components/FormattedDescription'

import CreateListing from '../../mutations/CreateListing'
import UpdateListing from '../../mutations/UpdateListing'

const ReviewListing = ({ listing, prev, ...props }) => {
  // const quantity = Number(listing.quantity || 0)

  return (
    <>
      <h1>
        <Link to={prev} className="back d-md-none" />
        <fbt desc="createListing.review">Review</fbt>
      </h1>
      <div className="step-description mb-0 mt-4">
        <fbt desc="createListing.reviewDescription">
          Review your listing and click Publish to make it available on Origin
        </fbt>
      </div>
      <div className="row">
        <div className="col-md-8">
          <div className="listing-step no-pad">
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
            <div className="actions">
              <Link
                className="btn btn-outline-primary d-none d-md-inline-block"
                to={prev}
              >
                <fbt desc="back">Back</fbt>
              </Link>
              {listing.id ? (
                <UpdateListing
                  listing={listing}
                  tokenBalance={props.tokenBalance}
                  refetch={props.refetch}
                  className="btn btn-primary"
                  children={fbt('Publish', 'createListing.publish')}
                />
              ) : (
                <CreateListing
                  listing={listing}
                  tokenBalance={props.tokenBalance}
                  className="btn btn-primary"
                  children={fbt('Publish', 'createListing.publish')}
                />
              )}
            </div>
          </div>
        </div>
        <div className="col-md-4 d-none d-md-block">
          <div className="gray-box">
            <fbt desc="create.details.help">
              <h5>Add Listing Details</h5>
              Be sure to give your listing an appropriate title and description
              to let others know what you&apos;re offering. Adding some photos
              will increase the chances of selling your listing.
            </fbt>
          </div>
        </div>
      </div>
    </>
  )
}

export default ReviewListing

require('react-styl')(`
  .create-listing
    .listing-step
      .listing-review
        width: 100%
        max-width: 20rem
        margin-bottom: 2rem
        .title
          font-size: 28px
        .price-quantity
          display: flex
          justify-content: space-between
          align-items: center
          .price
            font-size: 24px
        .gallery-scroll-wrap
          border: 1px solid var(--light)
          border-radius: 0.5rem
          margin: 1rem 0
        dl
          font-size: 20px
          dt
            color: var(--bluey-grey)
            font-weight: normal
            margin-top: 1rem
            border-top: 1px solid var(--light)
            padding-top: 1rem
`)
