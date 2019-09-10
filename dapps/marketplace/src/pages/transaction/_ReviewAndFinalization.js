import React, { useState, useEffect, Fragment } from 'react'
import { fbt } from 'fbt-runtime'

import StarRating from 'components/StarRating'
import Stages from 'components/TransactionStages'
import AddData from 'pages/transaction/mutations/AddData'
import Link from 'components/Link'

import ShippingAddress from './_ShippingAddress'

const RATED_OFFERS_KEY = 'rated_offers'
const ReviewAndFinalization = props => {
  const [rating, setRating] = useState(0)
  const [review, setReview] = useState('')
  const [offerRated, setOfferRated] = useState(false)
  const isSeller = props.viewedBy === 'seller'
  const isBuyer = props.viewedBy === 'buyer'

  useEffect(() => {
    const offersRatedString = localStorage.getItem(RATED_OFFERS_KEY)
    const offer = props.offer

    if (offersRatedString) {
      setOfferRated(JSON.parse(offersRatedString).includes(offer.id))
    }
  }, [])

  const renderFinalization = ({ loading, offer, isSeller, isBuyer }) => {
    return (
      <div className={`transaction-progress${loading ? ' loading' : ''}`}>
        <div className="tx-progress-wrapper">
          <div className="tx-receipt-status top">
            <h4>
              {isSeller && (
                <fbt desc="Progress.yourSaleComplete">
                  Your sale is complete.
                </fbt>
              )}
              {isBuyer && (
                <fbt desc="Progress.yourPurchaseComplete">
                  Your purchase is complete.
                </fbt>
              )}
            </h4>
            <Stages className="mt-4" mini="true" offer={offer} />
            {isBuyer && (
              <Fragment>
                <div className="help mb-0 mt-4">
                  <fbt desc="Progress.seeOtherListings">
                    See what other listings are available on Origin.
                  </fbt>
                </div>
                <div className="actions">
                  <div className="btn btn-link mr-auto">
                    <Link to="/">
                      <fbt desc="Progress.viewListings">View Listings</fbt>
                    </Link>
                  </div>
                </div>
              </Fragment>
            )}
            {isSeller && (
              <div className="actions">
                <div className="btn btn-link mr-auto">
                  <Link to="/create">
                    <fbt desc="Progress.createAnotherListing">
                      Create Another Listing
                    </fbt>
                  </Link>
                </div>
              </div>
            )}
          </div>
          <ShippingAddress offer={offer} />
        </div>
      </div>
    )
  }

  const rateOffer = offerId => {
    const offersRated = JSON.parse(
      localStorage.getItem(RATED_OFFERS_KEY) || '[]'
    )
    offersRated.push(offerId)

    setOfferRated(true)
    localStorage.setItem(RATED_OFFERS_KEY, JSON.stringify(offersRated))
  }

  const renderRating = ({ offer, loading, isSeller, isBuyer }) => {
    const reviewData = {
      schemaId: 'https://schema.originprotocol.com/review_1.0.0.json'
    }

    if (rating !== 0) {
      reviewData.rating = rating
    }
    if (review !== '') {
      reviewData.text = review
    }

    return (
      <div className={`transaction-progress${loading ? ' loading' : ''}`}>
        <div className="top">
          <h4>
            {isSeller && (
              <fbt desc="Progress.leaveBuyerReview">
                Leave a review of the buyer.
              </fbt>
            )}
            {isBuyer && (
              <fbt desc="Progress.leaveSellerReview">
                Leave a review of the seller.
              </fbt>
            )}
          </h4>
          <div className="help">
            {isBuyer && (
              <fbt desc="Progress.letOtherBuyersKnow">
                Let other buyers know about your experience transacting with
                this seller.
              </fbt>
            )}
            {isSeller && (
              <fbt desc="Progress.letOtherSellersKnow">
                Let other sellers know about your experience transacting with
                this buyer.
              </fbt>
            )}
          </div>
          <div className="review">
            <div>
              <fbt desc="Progress.rateYourExperience">
                How would you rate your experience?
              </fbt>
            </div>
            <StarRating
              active={rating}
              onChange={rating => setRating(rating)}
            />
            <div>
              {isBuyer && (
                <fbt desc="Progress.reviewYourExperience">
                  Describe your experience transacting with this seller.
                </fbt>
              )}
              {isSeller && (
                <fbt desc="Progress.reviewYourExperience">
                  Describe your experience transacting with this buyer.
                </fbt>
              )}
            </div>
            <textarea
              className="form-control"
              value={review}
              placeholder={fbt('Write a review here', 'writeReviewHere')}
              onChange={e => setReview(e.target.value)}
            />
          </div>
          <div className="d-flex flex-column">
            <AddData
              disabled={rating === 0}
              data={JSON.stringify(reviewData)}
              offer={offer}
              refetch={props.refetch}
              onSuccess={() => rateOffer(offer.id)}
              onClick={() => rateOffer(offer.id)}
              from={isBuyer ? offer.buyer.id : offer.listing.seller.id}
              className="btn btn-primary mr-md-auto"
            >
              <fbt desc="Progress.submit">Submit</fbt>
            </AddData>
          </div>
        </div>
      </div>
    )
  }

  return offerRated
    ? renderFinalization({ ...props, isSeller, isBuyer })
    : renderRating({ ...props, isSeller, isBuyer })
}

export default ReviewAndFinalization

require('react-styl')(`
  .transaction-progress
    .review
      font-size: 18px
      color: black
      font-weight: bold
      margin-bottom: 2rem
      .star-rating
        margin: 0.5rem 0 2rem 0
      textarea
        margin-top: 0.5rem
`)
