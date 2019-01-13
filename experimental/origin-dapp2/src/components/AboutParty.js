import React, { Component } from 'react'
import { Query } from 'react-apollo'
import get from 'lodash/get'

import Redirect from 'components/Redirect'
import Identicon from 'components/Identicon'
import Avatar from 'components/Avatar'
import SendMessage from 'components/SendMessage'
import Tooltip from 'components/Tooltip'

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
        // onClick={() => this.setState({ redirect: true })}
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
                <Avatar avatar={profile.avatar} size={50} />
                <div>
                  <div className="name">{name}</div>
                  <div className="attestations">
                    {profile.twitterVerified && (
                      <Tooltip
                        tooltip="Twitter Account Verified"
                        placement="bottom"
                      >
                        <div className="attestation twitter" />
                      </Tooltip>
                    )}
                    {profile.googleVerified && (
                      <Tooltip
                        tooltip="Google Account Verified"
                        placement="bottom"
                      >
                        <div className="attestation google" />
                      </Tooltip>
                    )}
                    {profile.phoneVerified && (
                      <Tooltip tooltip="Phone Verified" placement="bottom">
                        <div className="attestation phone" />
                      </Tooltip>
                    )}
                    {profile.emailVerified && (
                      <Tooltip tooltip="Email Verified" placement="bottom">
                        <div className="attestation email" />
                      </Tooltip>
                    )}
                    {profile.facebookVerified && (
                      <Tooltip tooltip="Facebook Verified" placement="bottom">
                        <div className="attestation facebook" />
                      </Tooltip>
                    )}
                    {profile.airbnbVerified && (
                      <Tooltip
                        tooltip="Airbnb Account Verified"
                        placement="bottom"
                      >
                        <div className="attestation airbnb" />
                      </Tooltip>
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
        <div className="mt-3 text-center">
          <button
            className="btn btn-primary btn-rounded"
            onClick={e => {
              e.stopPropagation()
              this.setState({ message: true })
            }}
            children="Send Message"
          />
          {this.state.message && (
            <SendMessage
              to={id}
              onClose={() => this.setState({ message: false })}
            />
          )}
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
        margin-right: 1rem
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
