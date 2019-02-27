import React, { Component } from 'react'
import { Query } from 'react-apollo'
import gql from 'graphql-tag'

import Steps from 'components/Steps'
import Link from 'components/Link'

import ListingPreview from './_ListingPreview'
import HelpWallet from './_HelpWallet'

const MetaMaskURL =
  'https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn/related'

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
    >
      Install MetaMask
    </a>
    <Link to={back} className="cancel">
      Cancel
    </Link>
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
    <div className="metamask-logo" />
    <div className="status">Waiting for you to login to MetaMask</div>
    <div className="help">
      The MetaMask icon is located on the top right of your browser tool bar.
    </div>
    <div className="click-metamask-extension" />
    <Link to={back} className="cancel">
      Cancel
    </Link>
  </div>
)

class AwaitingApproval extends Component {
  componentDidMount() {
    setTimeout(() => window.ethereum.enable(), 50)
  }
  render() {
    const { back } = this.props
    return (
      <div className="onboard-box">
        <div className="metamask-logo" />
        <div className="status">Waiting for you to grant permission</div>
        <div className="help">
          Please grant Origin permission to access your MetaMask account so you
          can buy and sell on our DApp.
        </div>
        <div className="click-metamask-extension" />
        <button
          className="btn btn-outline-primary"
          onClick={() => window.ethereum.enable()}
        >
          Grant Permission
        </button>
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
      MetaMask is connected and you’re ready to transact on Origin.
    </div>
  </div>
)

class OnboardMetaMask extends Component {
  state = {}
  render() {
    const { listing } = this.props
    return (
      <>
        <div className="step">Step 1</div>
        <h3>Connect a Crypto Wallet</h3>
        <div className="row">
          <div className="col-md-8">
            <Steps steps={4} step={1} />
            <Query query={query} notifyOnNetworkStatusChange={true}>
              {({ error, data, networkStatus }) => {
                if (networkStatus === 1) {
                  return <div>Loading...</div>
                } else if (error) {
                  return <p className="p-3">Error :(</p>
                } else if (!data || !data.web3) {
                  return <p className="p-3">No Web3</p>
                }

                const backLink = `/listing/${listing.id}/onboard`
                const nextLink = `/listing/${listing.id}/onboard/messaging`
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
                    {/* <pre>{JSON.stringify(data, null, 4)}</pre> */}
                  </>
                )
                // return cmp
              }}
            </Query>
            {/* <pre>{JSON.stringify(data, null, 4)}</pre> */}
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
    .click-metamask-extension
      background: url(images/onboarding-metamask.png) no-repeat center
      background-size: 100%
      width: 73px
      height: 81px
      margin: 2rem 0
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
`)
