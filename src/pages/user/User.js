import React, { Component } from 'react'
import { FormattedMessage } from 'react-intl'
import { connect } from 'react-redux'

import { fetchUser } from 'actions/User'

import Avatar from 'components/avatar'
import Review from 'components/review'
import UnnamedUser from 'components/unnamed-user'
import WalletCard from 'components/wallet-card'

import origin from '../../services/origin'

class User extends Component {
  constructor(props) {
    super(props)

    this.state = { reviews: [] }
  }

  async componentDidMount() {
    const { fetchUser, userAddress } = this.props

    fetchUser(userAddress)

    const listingIdsAsSeller = await origin.marketplace.getListings({
      idsOnly: true,
      listingsFor: userAddress
    })
    const listingIdsAsBuyer = await origin.marketplace.getListings({
      idsOnly: true,
      purchasesFor: userAddress
    })
    const arrayOfArrays = await Promise.all([
      ...listingIdsAsBuyer,
      ...listingIdsAsSeller
    ].map(async id => origin.marketplace.getListingReviews(id)))
    const reviews = [].concat(...arrayOfArrays)

    this.setState({ reviews })
  }

  render() {
    const { user, userAddress } = this.props
    const { attestations, fullName, profile } = user
    const description =
      (profile && profile.description) || 'An Origin user without a description'
    const userReviews = this.state.reviews.filter(r => r.reviewer !== userAddress)

    return (
      <div className="public-user profile-wrapper">
        <div className="container">
          <div className="row">
            <div className="col-12 col-md-4 col-lg-4 order-md-3">
              <WalletCard wallet={{ address: userAddress }} withProfile={false} />
            </div>
            <div className="col-12 col-sm-4 col-md-3 col-lg-2 order-md-1">
              <Avatar
                image={profile && profile.avatar}
                className="primary"
                placeholderStyle="purple"
              />
            </div>
            <div className="col-12 col-sm-8 col-md-5 col-lg-6 order-md-2">
              <div className="name d-flex">
                <h1>{fullName || <UnnamedUser />}</h1>
              </div>
              <p>{description}</p>
            </div>
            <div className="col-12 col-sm-4 col-md-3 col-lg-2 order-md-4">
              {attestations &&
                !!attestations.length && (
                <div className="verifications-box">
                  <h3>
                    <FormattedMessage
                      id={'User.verifiedInto'}
                      defaultMessage={'Verified Info'}
                    />
                  </h3>
                  {/* need to know how to verify signature instead of just finding object by key */}
                  {attestations.find(a => a.service === 'phone') && (
                    <div className="service d-flex">
                      <img
                        src="images/phone-icon-verified.svg"
                        alt="phone verified icon"
                      />
                      <div>
                        <FormattedMessage
                          id={'User.phone'}
                          defaultMessage={'Phone'}
                        />
                      </div>
                    </div>
                  )}
                  {attestations.find(a => a.service === 'email') && (
                    <div className="service d-flex">
                      <img
                        src="images/email-icon-verified.svg"
                        alt="email verified icon"
                      />
                      <div>
                        <FormattedMessage
                          id={'User.email'}
                          defaultMessage={'Email'}
                        />
                      </div>
                    </div>
                  )}
                  {attestations.find(a => a.service === 'facebook') && (
                    <div className="service d-flex">
                      <img
                        src="images/facebook-icon-verified.svg"
                        alt="Facebook verified icon"
                      />
                      <div>
                        <FormattedMessage
                          id={'User.facebook'}
                          defaultMessage={'Facebook'}
                        />
                      </div>
                    </div>
                  )}
                  {attestations.find(a => a.service === 'twitter') && (
                    <div className="service d-flex">
                      <img
                        src="images/twitter-icon-verified.svg"
                        alt="Twitter verified icon"
                      />
                      <div>
                        <FormattedMessage
                          id={'User.twitter'}
                          defaultMessage={'Twitter'}
                        />
                      </div>
                    </div>
                  )}
                  {attestations.find(a => a.service === 'airbnb') && (
                    <div className="service d-flex">
                      <img
                        src="images/airbnb-icon-verified.svg"
                        alt="Airbnb verified icon"
                      />
                      <div>
                        <FormattedMessage
                          id={'User.airbnb'}
                          defaultMessage={'Airbnb'}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="col-12 col-sm-8 col-md-9 col-lg-10 order-md-5">
              <div className="reviews">
                <h2>
                  <FormattedMessage
                    id={'User.reviews'}
                    defaultMessage={'Reviews'}
                  />
                  &nbsp;<span className="review-count">
                    {Number(userReviews.length).toLocaleString()}
                  </span>
                </h2>
                {userReviews.map(r => <Review key={r.id} review={r} />)}
                {/* To Do: pagination */}
                {/* <a href="#" className="reviews-link">Read More<img src="/images/carat-blue.svg" className="down carat" alt="down carat" /></a> */}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state, { userAddress }) => {
  return {
    user: state.users.find(u => u.address === userAddress) || {}
  }
}

const mapDispatchToProps = dispatch => ({
  fetchUser: (addr, msg) => dispatch(fetchUser(addr, msg))
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(User)
