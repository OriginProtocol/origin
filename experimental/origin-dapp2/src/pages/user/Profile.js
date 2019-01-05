import React, { Component } from 'react'
import get from 'lodash/get'

import withWallet from 'hoc/withWallet'
import withIdentity from 'hoc/withIdentity'

import Reviews from 'components/Reviews'

const Loading = () => <div className="container user-profile">Loading...</div>

class Profile extends Component {
  render() {
    if (this.props.walletLoading || this.props.identityLoading) {
      return <Loading />
    }

    const profile = get(this.props.identity, 'profile')
    if (!profile) {
      return <div className="container user-profile">No Identity</div>
    }

    return (
      <div className="container user-profile">
        <div className="row">
          <div className="col-lg-2 col-md-3">
            {profile.avatar ? (
              <div
                className="main-avatar"
                style={{ backgroundImage: `url(${profile.avatar})` }}
              />
            ) : (
              <div className="main-avatar empty" />
            )}
            <div className="verified-info">
              <h5>Verified Info</h5>
              {profile.phoneVerified && (
                <div>
                  <div className="attestation phone" />
                  Phone
                </div>
              )}
              {profile.emailVerified && (
                <div>
                  <div className="attestation email" />
                  Email
                </div>
              )}
              {profile.facebookVerified && (
                <div>
                  <div className="attestation facebook" />
                  Facebook
                </div>
              )}
              {profile.twitterVerified && (
                <div>
                  <div className="attestation twitter" />
                  Twitter
                </div>
              )}
              {profile.googleVerified && (
                <div>
                  <div className="attestation google" />
                  Google
                </div>
              )}
              {profile.airbnbVerified && (
                <div>
                  <div className="attestation airbnb" />
                  AirBnb
                </div>
              )}
            </div>
          </div>
          <div className="col-lg-10 col-md-9">
            <h1 className="mb-0">{profile.fullName}</h1>
            <div className="description">{profile.description}</div>

            <div className="reviews-container">
              <Reviews id={this.props.wallet} />
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default withWallet(withIdentity(Profile))

require('react-styl')(`
  .user-profile
    padding-top: 3rem
    .main-avatar
      width: 100%
      padding-top: 100%
      background-size: contain;
      border-radius: 1rem;
      background-repeat: no-repeat
      background-position: center
      &.empty
        background: var(--dark-grey-blue) url(images/avatar-blue.svg) no-repeat center bottom;
        background-size: 63%
    .verified-info
      background-color: var(--pale-grey)
      padding: 1rem
      margin-top: 2rem
      border-radius: 1rem
      font-size: 14px
      h5
        font-size: 14px
        margin-bottom: 0.75rem
      > div
        display: flex
        align-items: center
        margin-bottom: 0.5rem
        &:last-child
          margin-bottom: 0
        .attestation
          margin-right: 0.5rem
          width: 1.5rem
          height: 1.5rem
    .reviews-container
      margin-top: 2rem

`)
