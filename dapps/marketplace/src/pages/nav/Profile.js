import React, { Component } from 'react'
import { Query } from 'react-apollo'
import { fbt } from 'fbt-runtime'

import withNetwork from 'hoc/withNetwork'
import withIdentity from 'hoc/withIdentity'
import withWallet from 'hoc/withWallet'
import withConfig from 'hoc/withConfig'

import ProfileQuery from 'queries/Profile'

import Link from 'components/Link'
import Dropdown from 'components/Dropdown'
import Balances from 'components/Balances'
import Avatar from 'components/Avatar'
import Attestations from 'components/Attestations'
import MobileUserActivation from 'components/MobileUserActivation'

// import DeployProxy from '../identity/mutations/DeployProxy'

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
          if (!data || !data.web3 || !data.web3.primaryAccount) {
            return null
          }

          // const walletType = data.web3.walletType
          // const { checksumAddress } = data.web3.primaryAccount
          return (
            <Dropdown
              el="li"
              className="nav-item dark profile"
              open={this.props.open}
              onClose={() => this.props.onClose()}
              content={
                <ProfileDropdown
                  identity={identity}
                  identityLoading={identityLoading}
                  // walletType={walletType}
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
                {identity && (
                  <Avatar
                    avatar={identity.avatar}
                    avatarUrl={identity.avatarUrl}
                    className="user-image-mask"
                  />
                )}
                {!identity && (
                  <img
                    className="user-image-mask"
                    src="images/identity/unknown-user-small.svg"
                  />
                )}
              </a>
            </Dropdown>
          )
        }}
      </Query>
    )
  }
}

class CreateIdentity extends Component {
  constructor(props) {
    super(props)
    this.state = {
      enable: false
    }
  }

  render() {
    return (
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
              Creating a profile allows other users to know that you are real
              and increases the chances of successful transactions on Origin.
            </fbt>
          </p>

          <button
            className="btn btn-primary"
            onClick={() => {
              this.setState({
                enable: true
              })
            }}
          >
            <fbt desc="nav.profile.getStarted">Get Started</fbt>
          </button>
        </div>
        {this.state.enable && <MobileUserActivation onClose={this.onClose} />}
      </>
    )
  }

  onClose = () => {
    this.setState({ enable: false }, () => {
      if (this.props.onClose) {
        this.props.onClose()
      }
    })
  }
}

const Network = withNetwork(({ networkName }) => (
  <div className="connected">
    <fbt desc="nav.profile.connectedToNetwork">Connected to</fbt>
    <span className="net">{networkName}</span>
  </div>
))

const WalletAddress = ({ wallet, walletType, children }) => {
  return (
    <div className="connected">
      {children || <fbt desc="nav.profile.activeWallet">Active wallet</fbt>}
      <span>
        <span className={`wallet-icon ${getWalletIconClass(walletType)}`} />
        <span className="wallet-name">{walletType}</span>
        <span className="wallet-address">{`${wallet.slice(
          0,
          4
        )}...${wallet.slice(-4)}`}</span>
      </span>
    </div>
  )
}

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
    <div className="identity">
      <fbt desc="nav.profile.profile">Profile</fbt>
      <div className="info">
        <Avatar profile={identity} size="3rem" />
        <div>
          <div className="name">
            {identity.fullName ||
              fbt('Unnamed User', 'nav.profile.unnamedUser')}
          </div>
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
        className="earn-ogn-link mt-3 mb-3"
      >
        <fbt desc="nav.profile.earnOGN">Strengthen profile &amp; earn OGN</fbt>
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

const ProfileDropdownRaw = ({
  data,
  identity,
  identityLoading,
  walletType,
  // wallet,
  // walletProxy,
  // config,
  onClose
}) => {
  const { checksumAddress, id } = data.web3.primaryAccount

  return (
    <div className="dropdown-menu dark dropdown-menu-right show profile">
      <div className="active-wallet-info">
        <Network />
        <WalletAddress wallet={checksumAddress} walletType={walletType} />
        {/* {!config.proxyAccountsEnabled ? null : (
          <>
            {walletProxy === wallet ? (
              <DeployProxy
                className="btn btn-sm btn-outline-primary px-3"
                children="Deploy"
              />
            ) : (
              <WalletAddress wallet={walletProxy} walletType={walletType}>
                <fbt desc="nav.profile.proxyAccount">Proxy Account</fbt>
              </WalletAddress>
            )}
          </>
        )} */}
      </div>
      <div className="identity-info">
        <Identity
          id={id}
          identity={identity}
          identityLoading={identityLoading}
          onClose={onClose}
        />
      </div>
    </div>
  )
}

const ProfileDropdown = withConfig(withWallet(ProfileDropdownRaw))

function getWalletIconClass(walletType) {
  switch (walletType) {
    case 'Origin Wallet':
      return 'origin'

    case 'MetaMask':
    case 'Meta Mask':
      return 'metamask'

    case 'Trust Wallet':
      return 'trust'

    case 'Coinbase Wallet':
      return 'toshi'

    case 'Cipher':
      return 'cipher'

    case 'Mist':
      return 'mist'

    case 'Parity':
      return 'parity'
  }

  return 'metamask'
}

export default withWallet(withIdentity(ProfileNav))

require('react-styl')(`
  .dropdown.profile.show
    background-color: black !important
  .user-image-mask
    width: 26px
    height: 26px
    padding-top: 3px
    border-radius: 40px
    border: solid 1px var(--white)
    background-color: var(--dark-grey-blue)
    &.large
      width: 80px
      height: 80px
      padding-top: 9px
      margin-top: 1rem
      margin-bottom: 0.5rem

  .dropdown-menu.profile
    width: 300px
    font-size: 14px
    margin-top: 0 !important
    &:before
      content: ''
      width: 0 !important
      height: 0 !important
      margin: 0 !important
      padding: 0 !important
    > div
      padding: 0.75rem 1.5rem
      border-bottom: 2px solid black
    .active-wallet-info
      padding: 1rem
      background-color: black
      .connected
        padding: 0
        color: var(--light)
        > span
          display: inline-block
          margin-left: 4px
          > .wallet-icon
            display: inline-block
            width: 10px
            height: 10px
            margin-right: 4px
            margin-left: 6px
            background-image: url('images/metamask.svg')
            background-size: 10px 10px
          > .wallet-name
            color: white
            margin-left: 4px
            margin-right: 6px
          > .wallet-address
            font-size: 0.6rem
        > .net
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
    .identity-info
      background-color: var(--dark)
      .create-identity
        h3
          padding: 0.5rem 0
          margin-bottom: 0.5rem
        button
          border-radius: 2rem
          padding: 0.5rem 1rem
          width: 100%
        p
          color: white
          font-size: 0.9rem
          margin-bottom: 1.75rem
      
       .identity
         font-weight: bold
         .info
           margin-bottom: 1rem
           margin-top: 0.75rem
           display: flex
           .avatar
             margin-right: 0.75rem
             border-radius: 50%
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
          .earn-ogn-link
            font-size: 1rem
            display: inline-block
          .balances
            border-top: 1px solid #333
            h5
              font-size: 1rem

  @media (max-width: 767.98px)
    .dropdown-menu.profile
      width: auto
      &.show
        left: 0 !important
        right: 0 !important
`)
