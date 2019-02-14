import React, { Component } from 'react'
import { Query } from 'react-apollo'
import get from 'lodash/get'

import IdentityQuery from 'queries/Identity'
import Reviews from 'components/Reviews'
import Avatar from 'components/Avatar'

import UserListings from './_UserListings'

function parseUserSocialID(attestations) {
  const socialUrlObject = {}
  attestations.forEach(attestation => {
    const socialData = JSON.parse(attestation)
    socialUrlObject[socialData.data.attestation.site.siteName] =
      socialData.data.attestation.site.userId.raw
  })
  return socialUrlObject
}

class User extends Component {
  render() {
    const id = this.props.match.params.id
    return (
      <div className="container user-profile">
        <Query query={IdentityQuery} variables={{ id }}>
          {({ data, loading, error }) => {
            if (loading || error) return null
            const profile = get(data, 'web3.account.identity')
            if (!profile) {
              return <div>User Not Found</div>
            }
            const socialUrls = parseUserSocialID(profile.attestations)
            return (
              <>
                <div className="row">
                  <div className="col-lg-2 col-md-3">
                    <Avatar avatar={profile.avatar} className="main-avatar" />
                    {profile.attestations.length > 0 && (
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
                            <a
                              className="social-link"
                              href={
                                'https://twitter.com/' +
                                socialUrls['twitter.com']
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <div className="attestation twitter" />
                              Twitter
                            </a>
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
                            <a
                              className="social-link"
                              href={
                                'https://www.airbnb.com/users/show/' +
                                socialUrls['airbnb.com']
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <div className="attestation airbnb" />
                              AirBnb
                            </a>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="col-lg-10 col-md-9">
                    <h1 className="mb-0">{profile.fullName}</h1>
                    <div className="description">{profile.description}</div>

                    <div className="reviews-container">
                      <Reviews id={id} />
                    </div>

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
    .main-avatar
      border-radius: 1rem;
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
      .social-link
        display: flex
        text-decoration: underline
        color: black
      .social-link:hover
        text-decoration: none                        
    .reviews-container
      margin-top: 2rem
`)
