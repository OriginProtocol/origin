import React, { Component } from 'react'
import { FormattedMessage, FormattedNumber } from 'react-intl'

import Review from 'components/review'

import origin from '../services/origin'

class Reviews extends Component {
  constructor(props) {
    super(props)

    this.state = { reviews: [] }
  }

  async componentDidMount() {
    const { userAddress } = this.props

    const listingIdsAsSeller = await origin.marketplace.getListings({
      idsOnly: true,
      listingsFor: userAddress
    })
    const listingIdsAsBuyer = await origin.marketplace.getListings({
      idsOnly: true,
      purchasesFor: userAddress
    })
    const arrayOfArrays = await Promise.all(
      [...listingIdsAsBuyer, ...listingIdsAsSeller].map(async id =>
        origin.marketplace.getListingReviews(id)
      )
    )
    const reviews = [].concat(...arrayOfArrays)

    this.setState({ reviews })
  }

  render() {
    const { userAddress } = this.props
    const userReviews = this.state.reviews.filter(
      r => r.reviewer !== userAddress
    )

    return (
      <div className="reviews">
        <h2>
          <FormattedMessage id={'reviews.heading'} defaultMessage={'Reviews'} />
          &nbsp;<span className="review-count">
            <FormattedNumber value={userReviews.length} />
          </span>
        </h2>

        {userReviews.map(r => <Review key={r.id} review={r} />)}
        {/* To Do: pagination */}
        {/* <a href="#" className="reviews-link">Read More<img src="/images/carat-blue.svg" className="down carat" alt="down carat" /></a> */}
      </div>
    )
  }
}

export default Reviews
