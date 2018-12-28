import React, { Component } from 'react'
import { Query } from 'react-apollo'
import get from 'lodash/get'

import Redirect from 'components/Redirect'
import Identicon from 'components/Identicon'
import IdentityQuery from 'queries/Identity'

class AboutParty extends Component {
  state = {}
  render() {
    const { id } = this.props

    if (this.state.redirect) {
      return <Redirect to={`/user/${id}`} />
    }

    return (
      <div
        className="about-party"
        onClick={() => this.setState({ redirect: true })}
      >
        <Query query={IdentityQuery} variables={{ id }}>
          {({ data, loading, error }) => {
            if (loading || error) return null
            const profile = get(data, 'web3.account.identity.profile')
            if (!profile) {
              return null
            }

            const name = `${profile.firstName} ${profile.lastName}`

            return (
              <div className="profile">
                {profile.avatar ? (
                  <div
                    className="avatar"
                    style={{ backgroundImage: `url(${profile.avatar})` }}
                  />
                ) : (
                  <div className="avatar empty" />
                )}
                <div>
                  <div className="name">{name}</div>
                  <div className="attestations">
                    {profile.twitterVerified && (
                      <div className="attestation twitter" />
                    )}
                    {profile.googleVerified && (
                      <div className="attestation google" />
                    )}
                    {profile.phoneVerified && (
                      <div className="attestation phone" />
                    )}
                    {profile.emailVerified && (
                      <div className="attestation email" />
                    )}
                    {profile.facebookVerified && (
                      <div className="attestation facebook" />
                    )}
                    {profile.airbnbVerified && (
                      <div className="attestation airbnb" />
                    )}
                  </div>
                </div>
              </div>
            )
          }}
        </Query>
        <div className="eth-address">
          <Identicon size={40} address={id} />
          <div>
            <div>ETH Address:</div>
            <div className="address">{id}</div>
          </div>
        </div>
      </div>
    )
  }
}

export default AboutParty

require('react-styl')(`
  .about-party
    background: var(--pale-grey-eight)
    border-radius: 5px
    padding: 1rem
    font-size: 14px
    font-weight: normal
    cursor: pointer
    .profile
      display: flex
      margin-bottom: 1rem
      .avatar
        width: 50px;
        height: 50px;
        background-size: contain;
        border-radius: 5px;
        margin-right: 1rem
        &.empty
          background: var(--dark-grey-blue) url(images/avatar-blue.svg) no-repeat center bottom;
          background-size: 1.9rem;
      .name
        font-size: 18px
        font-weight: bold
        line-height: 1.25rem
        margin-bottom: 0.5rem
    .eth-address
      display: flex
      > img
        margin: 0 5px
      > div
        margin-left: 1rem
      .address
        word-break: break-all
`)
