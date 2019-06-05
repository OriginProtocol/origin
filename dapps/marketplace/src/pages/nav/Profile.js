import React, { Component } from 'react'
import { Query } from 'react-apollo'
import { fbt } from 'fbt-runtime'
import get from 'lodash/get'

import withIdentity from 'hoc/withIdentity'
import withWallet from 'hoc/withWallet'
import withConfig from 'hoc/withConfig'

import ProfileQuery from 'queries/Profile'

import Link from 'components/Link'
import Dropdown from 'components/Dropdown'
import Balances from 'components/Balances'
import Avatar from 'components/Avatar'
import Attestations from 'components/Attestations'
import UserActivationLink from 'components/UserActivationLink'

// import ActiveWalletInfo from './_ActiveWalletInfo'

class ProfileNav extends Component {
  constructor() {
    super()
    this.state = {}
  }

  render() {
    const { identity, identityLoading } = this.props

    const poll = window.transactionPoll || 1000
    return (
      <Query query={ProfileQuery} pollInterval={poll}>
        {({ data, error }) => {
          if (error) {
            console.error(error)
            return null
          }
          if (!get(data, 'web3.primaryAccount')) {
            return null
          }

          return (
            <Dropdown
              el="li"
              className="nav-item profile"
              open={this.props.open}
              onClose={() => this.props.onClose()}
              content={
                <ProfileDropdown
                  identity={identity}
                  identityLoading={identityLoading}
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
                  this.setState({ modal: true })
                  this.props.open ? this.props.onClose() : this.props.onOpen()
                }}
                role="button"
                aria-haspopup="true"
                aria-expanded="false"
              >
                <Avatar profile={identity} className="user-image-mask" />
              </a>
            </Dropdown>
          )
        }}
      </Query>
    )
  }
}

const CreateIdentity = onClose => (
  <>
    <div className="create-identity text-center">
      <img
        className="user-image-mask large"
        src="images/identity/unknown-user.svg"
      />
      <h3>
        <fbt desc="nav.profile.profileNotCreated">
          You haven&apos;t created a profile yet
        </fbt>
      </h3>
      <p>
        <fbt desc="nav.profile.createYourProfile">
          Creating a profile allows other users to know that you are real and
          increases the chances of successful transactions on Origin.
        </fbt>
      </p>

      <UserActivationLink
        className="btn btn-primary"
        onClick={() => onClose()}
        onClose={() => onClose()}
      />
    </div>
  </>
)

const Identity = ({ id, identity, identityLoading, onClose }) => {
  if (identityLoading) {
    return (
      <div>
        <fbt desc="nav.profile.identityLoading">
          Hold on while we load your identity...
        </fbt>
      </div>
    )
  }

  if (!identity) {
    return <CreateIdentity onClose={onClose} />
  }

  return (
    <div className="identity align-items-center d-flex flex-column">
      <div className="info">
        <Link onClick={() => onClose()} to="/profile" className="name">
          <Avatar profile={identity} size="3rem" />
        </Link>
        <div>
          <Link onClick={() => onClose()} to="/profile" className="name">
            {identity.fullName ||
              fbt('Unnamed User', 'nav.profile.unnamedUser')}
          </Link>
          <Attestations profile={identity} />
        </div>
      </div>
      <div className="strength">
        <div className="progress">
          <div
            className="progress-bar"
            style={{ width: `${identity.strength || '0'}%` }}
          />
        </div>
        {`${fbt(
          'Profile Strength',
          'nav.profile.ProfileStrength'
        )} - ${identity.strength || '0'}%`}
      </div>
      <Link
        onClick={() => onClose()}
        to="/profile"
        className="btn btn-rounded btn-outline-primary mt-3 mb-3"
      >
        <fbt desc="nav.profile.earnOGN">Earn OGN</fbt>
      </Link>
      <Balances
        account={id}
        onClose={onClose}
        title={<fbt desc="nav.profile.walletBalance">Wallet balance</fbt>}
        className="pt-3 pb-3"
      />
    </div>
  )
}

const ProfileDropdownRaw = ({ data, identity, identityLoading, onClose }) => {
  const { id } = data.web3.primaryAccount

  return (
    <>
      <div className="dropdown-menu-bg" onClick={() => onClose()} />
      <div className="dropdown-menu dropdown-menu-right show profile">
        <div className="identity-info">
          <Identity
            id={id}
            identity={identity}
            identityLoading={identityLoading}
            onClose={onClose}
          />
        </div>
        {/* <ActiveWalletInfo /> */}
      </div>
    </>
  )
}

const ProfileDropdown = withConfig(withWallet(ProfileDropdownRaw))

export default withWallet(withIdentity(ProfileNav))

require('react-styl')(`
  .user-image-mask
    width: 26px
    height: 26px
    padding-top: 3px
    border-radius: 40px
    background-color: var(--dark-grey-blue)
    &.large
      width: 80px
      height: 80px
      padding-top: 9px
      margin-top: 1rem
      margin-bottom: 0.5rem
  .dropdown.profile .nav-link
    position: relative
    border-left: 1px solid transparent
    border-right: 1px solid transparent
  .dropdown.profile.show .nav-link
    border-left: 1px solid var(--light)
    border-right: 1px solid var(--light)
    &::after
      content: ""
      position: absolute
      bottom: -1px
      left: 0
      right: 0
      border-bottom: 1px solid white
      z-index: 1001
  .dropdown-menu.profile
    width: 300px
    font-size: 14px
    margin-top: 0 !important
    &:before
      display: none !important
    > div
      padding: 0.75rem 1.5rem
    .identity-info
      .create-identity
        h3
          padding: 0.5rem 0
          margin-bottom: 0.5rem
          font-family: var(--default-font)
          font-weight: bold
          color: #000
          font-size: 22px
          line-height: normal
        .btn
          border-radius: 2rem
          padding: 0.5rem 3rem
          margin-bottom: 2rem
        p
          font-size: 14px
          margin-bottom: 1.75rem
          color: var(--bluey-grey)
          line-height: normal

       .identity
         font-weight: bold
         .info
           margin-bottom: 1rem
           margin-top: 0.75rem
           display: flex
           .avatar
             margin-right: 0.75rem
             border-radius: 50%
             cursor: pointer
           .name
              cursor: pointer
              font-size: 1.2rem

         .strength
           font-size: 10px
           text-transform: uppercase
           color: var(--steel)
           letter-spacing: 0.4px
           font-weight: normal
           .progress
             background-color: #f0f6f9
             height: 6px
             margin-bottom: 0.5rem
             .progress-bar
               background-color: var(--greenblue)
          .earn-ogn-link
            font-size: 1rem
            display: inline-block
          .balances
            border-top: 1px solid #333
            h5
              font-size: 1rem

  @media (max-width: 767.98px)
    .dropdown-menu.profile
      max-width: 300px
`)
