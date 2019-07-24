import React, { Component } from 'react'
import { Query } from 'react-apollo'
import gql from 'graphql-tag'
import { fbt } from 'fbt-runtime'

import Link from 'components/Link'
import MetaMaskAnimation from 'components/MetaMaskAnimation'
import HelpOriginWallet from 'components/DownloadApp'

import WalletHeader from './_WalletHeader'
import ListingPreview from './_ListingPreview'
import HelpWallet from './_HelpWallet'

import LoadingSpinner from 'components/LoadingSpinner'

const MetaMaskURL = 'https://metamask.io'

const query = gql`
  query WalletStatus {
    web3 {
      networkId
      networkName
      metaMaskEnabled
      metaMaskAvailable
      metaMaskApproved
      metaMaskUnlocked
      metaMaskNetworkId
      metaMaskNetworkName
      metaMaskAccount {
        id
      }
    }
  }
`

const NotInstalled = ({ onInstall, back }) => (
  <div className="onboard-box">
    <div className="metamask-logo" />
    <div className="status mb">MetaMask not installed</div>
    <a
      href={MetaMaskURL}
      target="blank"
      className="btn btn-outline-primary"
      onClick={() => onInstall()}
      children={fbt('Install MetaMask', 'Install MetaMask')}
    />
    <Link to={back} className="cancel" children={fbt('Cancel', 'Cancel')} />
  </div>
)

const ConfirmInstalled = () => (
  <div className="onboard-box">
    <div className="metamask-logo" />
    <div className="status">
      <fbt desc="onboard.Metamask.installing">Installing MetaMask...</fbt>
    </div>
    <div className="help mb">
      <fbt desc="onboard.Metamask.click">
        Please click below once MetaMask is installed
      </fbt>
    </div>
    <button
      className="btn btn-primary"
      onClick={() => window.location.reload()}
    >
      <fbt desc="continue">Continue</fbt>
    </button>
  </div>
)

const AwaitingLogin = ({ back }) => (
  <div className="onboard-box">
    <MetaMaskAnimation light />
    <div className="status">
      <fbt desc="onboard.Metamask.waitingForYou">
        Waiting for you to login to MetaMask
      </fbt>
    </div>
    <div className="help">
      <fbt desc="onboard.Metamask.help">
        The MetaMask icon is located on the top right of your browser tool bar.
      </fbt>
    </div>
    <Link to={back} className="cancel">
      <fbt desc="Cancel">Cancel</fbt>
    </Link>
  </div>
)

class AwaitingApproval extends Component {
  state = {}
  componentDidMount() {
    this.timeout = setTimeout(
      () =>
        window.ethereum.enable().catch(() => {
          this.setState({ declined: true })
        }),
      50
    )
  }
  render() {
    const { back } = this.props
    if (this.state.declined) {
      return (
        <div className="onboard-box">
          <div className="metamask-logo" />
          <div className="status">
            <fbt desc="onboard.Metamask.oops">Oops, you denied permission</fbt>
          </div>
          <div className="help">
            <fbt desc="onboard.Metamask.oopsHelp">
              You must grant Origin permission to access your MetaMask account
              so you can buy and sell on our DApp.
            </fbt>
          </div>
          <button
            className="btn btn-outline-primary mt-4"
            onClick={() => {
              window.ethereum
                .enable()
                .catch(() => this.setState({ declined: true }))
              this.setState({ declined: false })
            }}
          >
            <fbt desc="onboard.Metamask.grantPermission">Grant Permission</fbt>
          </button>
          <Link to={back} className="cancel">
            <fbt desc="Cancel">Cancel</fbt>
          </Link>
        </div>
      )
    }
    return (
      <div className="onboard-box">
        <MetaMaskAnimation light />
        <div className="status">
          <fbt desc="onboard.Metamask.waitingForYou">
            Waiting for you to grant permission
          </fbt>
        </div>
        <div className="help">
          <fbt desc="onboard.Metamask.waitingForYouHelp">
            Please grant Origin permission to access your MetaMask account so
            you can buy and sell on our DApp.
          </fbt>
        </div>
        <Link to={back} className="cancel">
          <fbt desc="Cancel">Cancel</fbt>
        </Link>
      </div>
    )
  }
}

const IncorrectNetwork = ({ networkName, connectTo }) => (
  <div className="onboard-box">
    <div className="metamask-logo" />
    <div className="status">
      <fbt desc="onboard.Metamask.connected">MetaMask Connected</fbt>
    </div>
    <div className="connected">
      <span className="oval warn" />
      {networkName}
    </div>
    <div className="help mb">
      <fbt desc="onboard.Metamask.switchNetwork">
        Metamask is connected, please switch to{' '}
        <fbt:param name="connectTo">${connectTo}</fbt:param> in order to
        transact on Origin.
      </fbt>
    </div>
  </div>
)

const Connected = ({ networkName, nextLink }) => (
  <div className="onboard-box">
    <div className="metamask-logo" />
    <div className="status">
      <fbt desc="onboard.Metamask.connected">MetaMask Connected</fbt>
    </div>
    <div className="connected">
      <span className="oval" />
      {networkName}
    </div>
    <div className="help mb">
      <fbt desc="onboard.Metamask.connectedAndReady">
        MetaMask is connected and you’re ready to transact on Origin. Click
        Continue below.
      </fbt>
    </div>

    <Link to={nextLink} className={`btn btn-primary`}>
      <fbt desc="continue">Continue</fbt>
    </Link>
  </div>
)

class OnboardMetaMask extends Component {
  state = {}
  render() {
    const { listing, linkPrefix, hideOriginWallet } = this.props

    return (
      <>
        <WalletHeader />
        <div className="row">
          <div className="col-md-8">
            <Query query={query} notifyOnNetworkStatusChange>
              {({ error, data, networkStatus }) => {
                if (networkStatus === 1) {
                  return <LoadingSpinner/>
                } else if (error) {
                  return <p className="p-3">Error :(</p>
                } else if (!data || !data.web3) {
                  return <p className="p-3">No Web3</p>
                }

                const backLink = `${linkPrefix}/onboard`
                const nextLink = `${linkPrefix}/onboard/email`

                const { web3 } = data

                if (!web3.metaMaskAvailable && !this.state.installing) {
                  return (
                    <NotInstalled
                      back={backLink}
                      onInstall={() => this.setState({ installing: true })}
                    />
                  )
                } else if (!web3.metaMaskAvailable) {
                  return <ConfirmInstalled />
                } else if (!web3.metaMaskUnlocked) {
                  return <AwaitingLogin back={backLink} />
                } else if (!web3.metaMaskApproved) {
                  return <AwaitingApproval back={backLink} />
                } else if (web3.networkId !== web3.metaMaskNetworkId) {
                  return (
                    <IncorrectNetwork
                      connectTo={web3.networkName}
                      networkName={web3.metaMaskNetworkName}
                    />
                  )
                } else {
                  return (
                    <Connected
                      nextLink={nextLink}
                      networkName={web3.metaMaskNetworkName}
                    />
                  )
                }
              }}
            </Query>
          </div>
          <div className="col-md-4">
            <ListingPreview listing={listing} />
            {!hideOriginWallet && <HelpOriginWallet />}
            <HelpWallet />
          </div>
        </div>
      </>
    )
  }
}

export default OnboardMetaMask

require('react-styl')(`
  .onboard .onboard-box
    .metamask-logo
      background: url(images/metamask.svg) no-repeat center
      background-size: 7rem
      height: 7rem
      width: 7rem
    .help
      max-width: 32rem
    .connected
      margin: -0.5rem 0 1.5rem 0
      .oval
        width: 0.75rem
        height: 0.75rem
        background-color: var(--greenblue)
        display: inline-block
        border-radius: 0.5rem
        margin-right: 0.5rem
        &.warn
          background-color: var(--golden-rod)
        &.danger
          background-color: var(--orange-red)
`)
