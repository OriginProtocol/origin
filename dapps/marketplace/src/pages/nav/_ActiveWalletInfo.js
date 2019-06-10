import React from 'react'
import { fbt } from 'fbt-runtime'

import withNetwork from 'hoc/withNetwork'
import withWallet from 'hoc/withWallet'
import withConfig from 'hoc/withConfig'

import DeployProxy from '../identity/mutations/DeployProxy'

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

const ActiveWalletInfo = ({ walletType, wallet, config, walletProxy }) => (
  <div className="active-wallet-info">
    <Network />
    <WalletAddress wallet={wallet} walletType={walletType} />
    {!config.proxyAccountsEnabled ? null : (
      <div className="connected mt-2 proxy-acct">
        <fbt desc="nav.profile.proxyAccount">Proxy Account</fbt>
        {walletProxy === wallet ? (
          <DeployProxy
            className="btn btn-sm btn-outline-primary px-3"
            children="Deploy"
          />
        ) : (
          <span>{walletProxy}</span>
        )}
      </div>
    )}
  </div>
)

export default withConfig(withWallet(ActiveWalletInfo))

require('react-styl')(`
  .dropdown-menu.profile
    .active-wallet-info
      padding: 1rem
      .connected.proxy-acct
        display: flex
        align-items: center
        justify-content: space-between
        white-space: nowrap
        > span
          text-overflow: ellipsis
          overflow: hidden
          margin-left: 0.5rem
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
            background-size: 10px 10px
            &.metamask
              background-image: url('images/metamask.svg')
          > .wallet-name
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
`)
