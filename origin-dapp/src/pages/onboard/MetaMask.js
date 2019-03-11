import React, { Component } from 'react'
import { Query } from 'react-apollo'
import gql from 'graphql-tag'

import Steps from 'components/Steps'
import Link from 'components/Link'
import MetaMaskAnimation from 'components/MetaMaskAnimation'

import Header from './_Header'
import ListingPreview from './_ListingPreview'
import HelpWallet from './_HelpWallet'

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
        balance {
          eth
        }
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
      children="Install MetaMask"
    />
    <Link to={back} className="cancel" children="Cancel" />
  </div>
)

const ConfirmInstalled = () => (
  <div className="onboard-box">
    <div className="metamask-logo" />
    <div className="status">Installing MetaMask...</div>
    <div className="help mb">Please click below once MetaMask is installed</div>
    <button
      className="btn btn-outline-primary"
      onClick={() => window.location.reload()}
    >
      Continue
    </button>
  </div>
)

const AwaitingLogin = ({ back }) => (
  <div className="onboard-box">
    <MetaMaskAnimation light />
    <div className="status">Waiting for you to login to MetaMask</div>
    <div className="help">
      The MetaMask icon is located on the top right of your browser tool bar.
    </div>
    <Link to={back} className="cancel">
      Cancel
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
          <div className="status">Oops, you denied permission</div>
          <div className="help">
            You must grant Origin permission to access your MetaMask account so
            you can buy and sell on our DApp.
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
            Grant Permission
          </button>
          <Link to={back} className="cancel">
            Cancel
          </Link>
        </div>
      )
    }
    return (
      <div className="onboard-box">
        <MetaMaskAnimation light />
        <div className="status">Waiting for you to grant permission</div>
        <div className="help">
          Please grant Origin permission to access your MetaMask account so you
          can buy and sell on our DApp.
        </div>
        <Link to={back} className="cancel">
          Cancel
        </Link>
      </div>
    )
  }
}

const IncorrectNetwork = ({ networkName, connectTo }) => (
  <div className="onboard-box">
    <div className="metamask-logo" />
    <div className="status">MetaMask Connected</div>
    <div className="connected">
      <span className="oval warn" />
      {networkName}
    </div>
    <div className="help mb">
      {`Metamask is connected, please switch to ${connectTo} in order to transact on Origin.`}
    </div>
  </div>
)

const Connected = ({ networkName }) => (
  <div className="onboard-box">
    <div className="metamask-logo" />
    <div className="status">MetaMask Connected</div>
    <div className="connected">
      <span className="oval" />
      {networkName}
    </div>
    <div className="help mb">
      MetaMask is connected and you’re ready to transact on Origin. Click
      Continue below.
    </div>
  </div>
)

class OnboardMetaMask extends Component {
  state = {}
  render() {
    const { listing } = this.props
    const linkPrefix = listing ? `/listing/${listing.id}` : ''

    return (
      <>
        <Header />
        <div className="step">Step 1</div>
        <h3>Connect a Crypto Wallet</h3>
        <div className="row">
          <div className="col-md-8">
            <Steps steps={4} step={1} />
            <Query query={query} notifyOnNetworkStatusChange>
              {({ error, data, networkStatus }) => {
                if (networkStatus === 1) {
                  return <div>Loading...</div>
                } else if (error) {
                  return <p className="p-3">Error :(</p>
                } else if (!data || !data.web3) {
                  return <p className="p-3">No Web3</p>
                }

                const backLink = `${linkPrefix}/onboard`
                const nextLink = `${linkPrefix}/onboard/messaging`
                let nextEnabled = false
                const { web3 } = data

                let cmp
                if (!web3.metaMaskAvailable && !this.state.installing) {
                  cmp = (
                    <NotInstalled
                      back={backLink}
                      onInstall={() => this.setState({ installing: true })}
                    />
                  )
                } else if (!web3.metaMaskAvailable) {
                  cmp = <ConfirmInstalled />
                } else if (!web3.metaMaskUnlocked) {
                  cmp = <AwaitingLogin back={backLink} />
                } else if (!web3.metaMaskApproved) {
                  cmp = <AwaitingApproval back={backLink} />
                } else if (web3.networkId !== web3.metaMaskNetworkId) {
                  cmp = (
                    <IncorrectNetwork
                      connectTo={web3.networkName}
                      networkName={web3.metaMaskNetworkName}
                    />
                  )
                } else {
                  nextEnabled = true
                  cmp = <Connected networkName={web3.metaMaskNetworkName} />
                }

                return (
                  <>
                    {cmp}
                    <div className="continue-btn">
                      <Link
                        to={nextLink}
                        className={`btn btn-primary${
                          nextEnabled ? '' : ' disabled'
                        }`}
                      >
                        Continue
                      </Link>
                    </div>
                  </>
                )
              }}
            </Query>
          </div>
          <div className="col-md-4">
            <ListingPreview listing={listing} />
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
