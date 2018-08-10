import React, { Component } from 'react'
import { FormattedMessage, defineMessages, injectIntl } from 'react-intl'
import { connect } from 'react-redux'

import { fetchUser } from 'actions/User'

import Avatar from 'components/avatar'
import Review from 'components/review'

import Wallet from 'pages/profile/_Wallet'

class User extends Component {
  constructor(props) {
    super(props)

    this.state = { reviews: [] }

    this.intlMessages = defineMessages({
      unnamedUser: {
        id: 'user.unnamedUser',
        defaultMessage: 'Unnamed User'
      }
    })
  }

  async componentWillMount() {
    this.props.fetchUser(
      this.props.userAddress,
      this.props.intl.formatMessage(this.intlMessages.unnamedUser)
    )
    // TODO: User reviews
  }

  render() {
    const { address, fullName, profile, attestations } = this.props.user
    const description =
      (profile && profile.description) || 'An Origin user without a description'
    const usersReviews = this.state.reviews.filter(
      r => r.revieweeAddress === address
    )

    return (
      <div className="public-user profile-wrapper">
        <div className="container">
          <div className="row">
            <div className="col-12 col-md-4 col-lg-4 order-md-3">
              <Wallet address={address} />
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
                <h1>{fullName}</h1>
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
                    {Number(usersReviews.length).toLocaleString()}
                  </span>
                </h2>
                {usersReviews.map(r => (
                  <Review key={r.transactionHash} review={r} />
                ))}
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
)(injectIntl(User))
