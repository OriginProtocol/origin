import React, { Component } from 'react'
import { Mutation, Query } from 'react-apollo'
import get from 'lodash/get'

import withNetwork from 'hoc/withNetwork'
import ProfileQuery from 'queries/Profile'
import IdentityQuery from 'queries/Identity'
import UnlinkMobileWalletMutation from 'mutations/UnlinkMobileWallet'

import Link from 'components/Link'
import Identicon from 'components/Identicon'
import Dropdown from 'components/Dropdown'
import Balances from 'components/Balances'
import Avatar from 'components/Avatar'

class ProfileNav extends Component {
  constructor() {
    super()
    this.state = {}
  }

  render() {
    return (
      <Query query={ProfileQuery} pollInterval={1000}>
        {({ data, error }) => {
          if (error) {
            console.error(error)
            return null
          }
          if (!data || !data.web3 || !data.web3.primaryAccount) {
            return null
          }

          const { checksumAddress } = data.web3.primaryAccount
          return (
            <Dropdown
              el="li"
              className="nav-item dark profile"
              open={this.props.open}
              onClose={() => this.props.onClose()}
              content={
                <ProfileDropdown
                  onClose={() => this.props.onClose()}
                  data={data}
                />
              }
            >
              <a
                className="nav-link"
                href="#"
                onClick={e => {
                  e.preventDefault()
                  this.props.open ? this.props.onClose() : this.props.onOpen()
                }}
                role="button"
                aria-haspopup="true"
                aria-expanded="false"
              >
                <Identicon address={checksumAddress} />
              </a>
            </Dropdown>
          )
        }}
      </Query>
    )
  }
}

const Network = withNetwork(({ networkName }) => (
  <div className="connected">
    {`Connected to `}
    <span className="net">{networkName}</span>
  </div>
))

const ProfileDropdown = ({ data, onClose }) => {
  const { checksumAddress, id } = data.web3.primaryAccount
  const mobileWallet = data.web3.walletType.startsWith('mobile-')
  return (
    <Mutation mutation={UnlinkMobileWalletMutation}>
      {unlinkMutation => (
        <div className="dropdown-menu dark dropdown-menu-right show profile">
          <Network />
          <div className="wallet-info">
            <div>
              <h5>ETH Address</h5>
              <div className="wallet-address">{checksumAddress}</div>
            </div>
            <div className="identicon">
              <Identicon size={50} address={checksumAddress} />
            </div>
          </div>
          <Balances account={id} />
          <Identity id={id} />
          {mobileWallet && (
            <a
              className="unlink-wallet"
              onClick={e => {
                e.preventDefault()
                unlinkMutation()
              }}
              href="#"
              children="Unlink Mobile"
            />
          )}
          {!localStorage.loggedInAs ? null : (
            <a
              className="unlink-wallet"
              onClick={e => {
                e.preventDefault()
                delete localStorage.loggedInAs
                onClose()
              }}
              href="#"
              children="Logout"
            />
          )}
          <Link onClick={() => onClose()} to="/profile">
            Edit Profile
          </Link>
        </div>
      )}
    </Mutation>
  )
}

const Identity = ({ id }) => (
  <Query query={IdentityQuery} variables={{ id }}>
    {({ data, error }) => {
      if (error) return null
      const profile = get(data, 'web3.account.identity') || {}

      return (
        <div className="identity">
          <h5>My Identity</h5>
          <div className="info">
            <Avatar avatar={profile.avatar} size="3rem" />
            <div>
              <div className="name">{profile.fullName || 'Unnamed User'}</div>
              <div className="attestations">
                {profile.twitterVerified && (
                  <div className="attestation twitter" />
                )}
                {profile.googleVerified && (
                  <div className="attestation google" />
                )}
                {profile.phoneVerified && <div className="attestation phone" />}
                {profile.emailVerified && <div className="attestation email" />}
                {profile.facebookVerified && (
                  <div className="attestation facebook" />
                )}
                {profile.airbnbVerified && (
                  <div className="attestation airbnb" />
                )}
              </div>
            </div>
          </div>
          <div className="strength">
            <div className="progress">
              <div
                className="progress-bar"
                style={{ width: `${profile.strength || '0'}%` }}
              />
            </div>
            {`Profile Strength - ${profile.strength || '0'}%`}
          </div>
        </div>
      )
    }}
  </Query>
)

export default ProfileNav

require('react-styl')(`
  .dropdown-menu.profile
    width: 300px
    font-size: 14px
    > div
      padding: 0.75rem 1.5rem
      border-bottom: 2px solid black;
      &:nth-last-child(2)
        border-bottom: 0
    h5
      color: var(--light)
      font-size: 14px
    .connected
      padding: 0.75rem 1.5rem;
      color: var(--light)
      > span
        display: inline-block
        color: var(--greenblue)
        &::before
          content: ""
          display: inline-block
          background: var(--greenblue)
          width: 10px
          height: 10px
          border-radius: var(--default-radius)
          margin-right: 4px
          margin-left: 6px
    .nav-link img
      margin: 0 0.2rem
    .wallet-info
      display: flex
      flex-direction: row
      font-size: 14px
      .wallet-address
        word-break: break-all
        line-height: normal
      .identicon
        margin-left: 0.5rem
        display: flex
        align-items: center
    .identity
      font-weight: bold
      .info
        margin-bottom: 1rem
        margin-top: 0.75rem
        display: flex
        .avatar
          margin-right: 0.75rem
        .name
          font-size: 18px

      .strength
        font-size: 10px;
        text-transform: uppercase;
        color: var(--steel);
        letter-spacing: 0.4px;
        .progress
          background-color: #000
          height: 6px
          margin-bottom: 0.5rem
          .progress-bar
            background-color: var(--greenblue)

    > a
      display: block
      background: var(--dark-grey-blue)
      color: var(--white)
      text-align: center
      padding: 0.75rem 1rem;
      font-weight: bold;
      border-radius: 0 0 5px 5px;
      &.unlink-wallet
        border-bottom: 1px solid black
        border-radius: 0

  .attestations
    display: flex
  .attestation
    background-repeat: no-repeat
    background-position: center
    background-size: contain
    width: 1.25rem
    height: 1.25rem
    margin-right: 0.25rem
    &.email
      background-image: url(images/identity/email-icon-verified.svg)
    &.facebook
      background-image: url(images/identity/facebook-icon-verified.svg)
    &.phone
      background-image: url(images/identity/phone-icon-verified.svg)
    &.twitter
      background-image: url(images/identity/twitter-icon-verified.svg)
    &.airbnb
      background-image: url(images/identity/airbnb-icon-verified.svg)
    &.google
      background-image: url(images/identity/google-icon-verified.svg)

  @media (max-width: 767.98px)
    .dropdown-menu.profile
      width: auto
`)
