import React, { Component, Fragment } from 'react'
import { fbt } from 'fbt-runtime'

import StarRating from 'components/StarRating'
import Stages from 'components/TransactionStages'
import AddData from 'pages/transaction/mutations/AddData'
import Link from 'components/Link'

const RATED_OFFERS_KEY = 'rated_offers'
class ReviewAndFinalization extends Component {
  state = {
    rating: 0,
    review: '',
    offerRated: false
  }

  componentDidMount() {
    const offersRatedString = localStorage.getItem(RATED_OFFERS_KEY)
    const offer = this.props.offer

    if (offersRatedString) {
      this.setState({
        offerRated: JSON.parse(offersRatedString).includes(offer.id)
      })
    }
  }

  renderFinalization({ loading, offer, isSeller, isBuyer }) {
    return (
      <div className={`transaction-progress${loading ? ' loading' : ''}`}>
        <div className="top">
          <h4>
            {isSeller && (
              <fbt desc="Progress.yourSaleComplete">Your sale is complete.</fbt>
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
                <div className="btn btn-link">
                  <Link to="/">
                    <fbt desc="Progress.viewListings">View Listings</fbt>
                  </Link>
                </div>
              </div>
            </Fragment>
          )}
          {isSeller && (
            <div className="actions">
              <div className="btn btn-link">
                <Link to="/create">
                  <fbt desc="Progress.createAnotherListing">
                    Create Another Listing
                  </fbt>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  rateOffer(offerId) {
    const offersRated = JSON.parse(
      localStorage.getItem(RATED_OFFERS_KEY) || '[]'
    )
    offersRated.push(offerId)
    this.setState({
      offerRated: true
    })
    localStorage.setItem(RATED_OFFERS_KEY, JSON.stringify(offersRated))
  }

  renderRating({ offer, loading, isSeller, isBuyer }) {
    const { rating, review } = this.state

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
              onChange={rating => this.setState({ rating })}
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
              onChange={e => this.setState({ review: e.target.value })}
            />
          </div>
          <div className="d-flex flex-column">
            <AddData
              disabled={rating === 0}
              data={JSON.stringify(reviewData)}
              offer={offer}
              refetch={this.props.refetch}
              onSuccess={() => this.rateOffer(offer.id)}
              onClick={() => this.rateOffer(offer.id)}
              wallet={isBuyer ? offer.buyer.id : offer.listing.seller.id}
              className="btn btn-primary mr-md-auto"
            >
              <fbt desc="Progress.submit">Submit</fbt>
            </AddData>
          </div>
        </div>
      </div>
    )
  }

  render() {
    const isSeller = this.props.viewedBy === 'seller'
    const isBuyer = this.props.viewedBy === 'buyer'

    return this.state.offerRated
      ? this.renderFinalization({ ...this.props, isSeller, isBuyer })
      : this.renderRating({ ...this.props, isSeller, isBuyer })
  }
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
