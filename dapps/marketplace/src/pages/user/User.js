import React, { Component } from 'react'
import { Query } from 'react-apollo'
import get from 'lodash/get'
import { fbt } from 'fbt-runtime'

import IdentityQuery from 'queries/Identity'
import Reviews from 'components/Reviews'
import Avatar from 'components/Avatar'

import UserListings from './_UserListings'

class User extends Component {
  render() {
    const id = this.props.match.params.id
    return (
      <div className="container user-profile">
        <Query query={IdentityQuery} variables={{ id }}>
          {({ data, loading, error }) => {
            if (loading || error) return null
            const profile = get(data, 'web3.account.identity') || {}
            const noVerifications = !Object.keys(profile).some(k =>
              k.match(/verified/i)
            )

            return (
              <>
                <div className="row">
                  <div className="col-lg-2 col-md-3">
                    <div className="avatar-wrap">
                      <Avatar avatar={profile.avatar} className="main-avatar" />
                    </div>
                    {noVerifications ? null : (
                      <div className="verified-info">
                        <h5>
                          <fbt desc="User.verifiedInfo">Verified Info</fbt>
                        </h5>
                        {profile.phoneVerified && (
                          <div>
                            <div className="attestation phone" />
                            <fbt desc="User.phone">Phone></fbt>
                          </div>
                        )}
                        {profile.emailVerified && (
                          <div>
                            <div className="attestation email" />
                            <fbt desc="User.email">Email</fbt>
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
                    )}
                  </div>
                  <div className="col-lg-10 col-md-9">
                    <h1 className="mb-0">
                      {profile.fullName ||
                        fbt('Unnamed User', 'User.unamedUser')}
                    </h1>
                    <div className="description">
                      {profile.description ||
                        fbt('No description', 'User.noDescription')}
                    </div>

                    <Reviews id={id} hideWhenZero />

                    <UserListings user={id} />
                  </div>
                </div>
              </>
            )
          }}
        </Query>
      </div>
    )
  }
}

export default User

require('react-styl')(`
  .user-profile
    padding-top: 3rem
    h1
      line-height: 1.25
    .listings-count
      font-size: 32px
    .avatar-wrap
      .main-avatar
        border-radius: 1rem
    .description
      max-width: 50rem

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
    .reviews
      margin-top: 2rem
  @media (max-width: 767.98px)
    .user-profile
      padding-top: 2rem
      .avatar-wrap
        max-width: 8rem
        margin: 0 auto 1rem auto
`)
