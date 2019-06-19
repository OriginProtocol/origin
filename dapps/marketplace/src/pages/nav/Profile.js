import React from 'react'
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

const ProfileNav = ({ identity, identityLoading, open, onOpen, onClose }) => (
  <Query query={ProfileQuery} pollInterval={window.transactionPoll || 1000}>
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
          open={open}
          onClose={() => onClose()}
          content={
            <ProfileDropdown
              identity={identity}
              identityLoading={identityLoading}
              onClose={() => onClose()}
              data={data}
            />
          }
        >
          <a
            className="nav-link"
            href="#"
            onClick={e => {
              e.preventDefault()
              open ? onClose() : onOpen()
            }}
          >
            <Avatar profile={identity} />
          </a>
        </Dropdown>
      )
    }}
  </Query>
)

const CreateIdentity = onClose => (
  <>
    <div className="create-identity text-center">
      <Avatar />
      <h3>
        <fbt desc="nav.profile.profileNotCreated">
          You haven&apos;t created a profile
        </fbt>
      </h3>

      <div className="strength">
        <div className="progress" />
        <fbt desc="nav.profile.ProfileStrength">
          {'Profile Strength - '}
          <fbt:param name="percent">{'0%'}</fbt:param>
        </fbt>
      </div>
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
  if (identityLoading || !wallet) {
    return (
      <div className="identity-loading">
        <fbt desc="nav.profile.identityLoading">
          Hold on while we load your identity...
        </fbt>
      </div>
    )
  }

  if (!identity) {
    return <CreateIdentity onClose={onClose} />
  }
  const strengthPct = `${identity.strength || '0'}%`

  return (
    <div className="identity">
      <div className="info">
        <Link onClick={() => onClose()} to="/profile">
          <Avatar profile={identity} />
        </Link>
        <Link onClick={() => onClose()} to="/profile" className="name">
          {identity.fullName || fbt('Unnamed User', 'nav.profile.unnamedUser')}
        </Link>
        <Attestations profile={identity} />
      </div>
      <div className="strength">
        <div className="progress">
          <div className="progress-bar" style={{ width: strengthPct }} />
        </div>
        <fbt desc="nav.profile.ProfileStrength">
          {'Profile Strength - '}
          <fbt:param name="percent">{strengthPct}</fbt:param>
        </fbt>
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
        <a
          className="d-sm-none close-icon"
          href="#close"
          onClick={e => {
            e.preventDefault()
            onClose()
          }}
        >
          Close
        </a>
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
  .dropdown .nav-link
    position: relative
    border-left: 1px solid transparent
    border-right: 1px solid transparent
  .dropdown.show .nav-link
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
  .dropdown.nav-item.profile .avatar
    min-width: 28px
  .dropdown-menu.profile
    width: 250px
    font-size: 14px
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
        margin-top: 3rem
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
        .strength
          margin: 0.25rem 0 1.5rem 0

      .identity-loading
         padding-top: 3rem
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

      .strength
        width: 100%
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

  @media (max-width: 767.98px)
    .dropdown-menu.profile
      max-width: 300px
      .close-icon
        display: block
        position: absolute
        left: 1rem
        top: 1rem
        background: url(images/nav/close-icon.svg) no-repeat
        background-size: 26px
        text-indent: -9999px
        width: 2rem
        height: 2rem

`)
