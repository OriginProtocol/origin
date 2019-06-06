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
                <Avatar profile={identity} />
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
      <Avatar />
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

const Identity = ({ id, wallet, identity, identityLoading, onClose }) => {
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
    <div className="identity">
      <div className="info">
        <Avatar profile={identity} />
        <Link onClick={() => onClose()} to="/profile" className="name">
          {identity.fullName || fbt('Unnamed User', 'nav.profile.unnamedUser')}
        </Link>
        <Attestations profile={identity} />
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
        className="btn btn-outline-primary earn-ogn"
      >
        <fbt desc="nav.profile.earnOGN">Earn OGN</fbt>
      </Link>
      <Balances
        account={id}
        onClose={onClose}
        title={<fbt desc="nav.profile.walletBalance">Wallet balances</fbt>}
        className="pt-3 pb-3"
      />
      <div className="eth-address">
        {`ETH Address: ${wallet.substr(0, 7)}...`}
      </div>
    </div>
  )
}

const ProfileDropdownRaw = ({
  walletProxy,
  data,
  identity,
  identityLoading,
  onClose
}) => {
  const { id } = data.web3.primaryAccount

  return (
    <>
      <div className="dropdown-menu-bg" onClick={() => onClose()} />
      <div className="dropdown-menu dropdown-menu-right show profile">
        <div className="identity-info">
          <Identity
            id={id}
            wallet={walletProxy}
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
    width: 250px
    font-size: 14px
    margin-top: 0 !important
    &:before
      display: none !important
    > div
      padding: 0.75rem 1.5rem
    .identity-info
      .avatar
        border-radius: 50%
        width: 4.5rem
        padding-top: 4.5rem
      .create-identity
        display: flex
        flex-direction: column
        align-items: center
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
         text-align: center
         .info
           margin-bottom: 1rem
           margin-top: 0.75rem
           display: flex
           flex-direction: column
           align-items: center
           > a.name
            color: black
            font-size: 24px
            font-weight: bold
            margin: 0.75rem 0 0.5rem 0
            white-space: nowrap
            overflow: hidden
            width: 100%
            text-overflow: ellipsis

         .strength
           font-size: 10px
           text-transform: uppercase
           color: var(--steel)
           font-weight: normal
           .progress
             background-color: #f0f6f9
             height: 6px
             margin-bottom: 0.5rem
             .progress-bar
               background-color: var(--greenblue)
          .earn-ogn
            border-radius: 3rem
            margin: 1.5rem 0 1.25rem 0
            padding-left: 3rem
            padding-right: 3rem
          .balances
            border-top: 1px solid #dde6ea
            h5
              font-family: var(--heading-font)
              font-size: 14px
              text-align: center
          .eth-address
            color: var(--steel)
            font-size: 10px
            font-weight: normal
            margin: 0.5rem 0 1rem 0

  @media (max-width: 767.98px)
    .dropdown-menu.profile
      max-width: 300px
`)
