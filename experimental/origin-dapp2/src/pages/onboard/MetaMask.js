import React, { Component } from 'react'
import { Query } from 'react-apollo'
import gql from 'graphql-tag'

import ListingPreview from './_ListingPreview'
import Stage from './_Stage'
import HelpWallet from './_HelpWallet'
import Link from 'components/Link'

const query = gql`
  query WalletStatus {
    web3 {
      metaMaskEnabled
      metaMaskAvailable
      metaMaskApproved
      metaMaskUnlocked
      metaMaskNetworkId
      metaMaskAccount {
        id
        balance {
          eth
        }
      }
    }
  }
`

const NotInstalled = props => (
  <div className="metamask-install">
    <div className="metamask-logo" />
    <div className="status">MetaMask not installed</div>
    <a
      href="https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn/related"
      target="blank"
      className="btn btn-outline-primary"
      onClick={() => props.onInstall()}
    >
      Install MetaMask
    </a>
  </div>
)

const ConfirmInstalled = () => (
  <div className="metamask-install">
    <div className="metamask-logo" />
    <div className="status">Installing MetaMask...</div>
    <button
      className="btn btn-outline-primary"
      onClick={() => window.location.reload()}
    >
      Continue
    </button>
  </div>
)

const AwaitingLogin = () => (
  <div className="metamask-install">
    <div className="metamask-logo" />
    <div className="status">Waiting for you to login to Metamask</div>
    <div className="help">
      The Metamask icon is located on the top right of your browser tool bar.
    </div>
  </div>
)

const AwaitingApproval = () => (
  <div className="metamask-install">
    <div className="metamask-logo" />
    <div className="status">Waiting for you to grant permission</div>
    <div className="help">
      Please grant Origin permission to access your Metamask account so you can
      buy and sell on our DApp.
    </div>
    <button
      className="btn btn-outline-primary"
      onClick={() => window.ethereum.enable()}
    >
      Grant Permission
    </button>
  </div>
)

const Connected = props => (
  <div className="metamask-install">
    <div className="metamask-logo" />
    <div className="status">Metamask Connected</div>
    <div className="connected">
      <span className="oval" />
      Ethereum Main Network
    </div>
    <div className="help">
      Metamask is connected and you’re ready to transact on Origin. Click
      Continue below.
    </div>
    <Link
      to={`/listings/${props.listing.id}/onboard/messaging`}
      className="btn btn-outline-primary"
    >
      Continue
    </Link>
  </div>
)

class OnboardMetaMask extends Component {
  state = {}
  render() {
    const { listing } = this.props
    return (
      <Query query={query} notifyOnNetworkStatusChange={true}>
        {({ error, data, networkStatus }) => {
          if (networkStatus === 1) {
            return <div>Loading...</div>
          } else if (error) {
            return <p className="p-3">Error :(</p>
          } else if (!data || !data.web3) {
            return <p className="p-3">No Web3</p>
          }

          let cmp
          if (!data.web3.metaMaskAvailable && !this.state.installing) {
            cmp = (
              <NotInstalled
                onInstall={() => this.setState({ installing: true })}
              />
            )
          } else if (!data.web3.metaMaskAvailable) {
            cmp = <ConfirmInstalled onConfirm />
          } else if (!data.web3.metaMaskUnlocked) {
            cmp = <AwaitingLogin />
          } else if (!data.web3.metaMaskApproved) {
            cmp = <AwaitingApproval />
          } else {
            cmp = <Connected listing={this.props.listing} />
          }

          return (
            <>
              <div className="step">Step 1</div>
              <h3>Connect a Crypto Wallet</h3>
              <div className="row">
                <div className="col-md-8">
                  <Stage stage={1} />
                  {cmp}
                  {/* <pre>{JSON.stringify(data, null, 4)}</pre> */}
                </div>
                <div className="col-md-4">
                  <ListingPreview listing={listing} />
                  <HelpWallet />
                </div>
              </div>
            </>
          )
        }}
      </Query>
    )
  }
}

export default OnboardMetaMask

require('react-styl')(`
  .metamask-install
    border: 1px solid var(--light)
    border-radius: 5px
    padding: 2rem
    display: flex
    flex-direction: column
    align-items: center
    .metamask-logo
      background: url(images/metamask.svg) no-repeat center
      background-size: 6rem
      height: 6rem
      width: 6rem
    .status
      font-family: Poppins
      font-size: 24px
      font-weight: 300
      margin: 1rem 0 3rem 0
    .btn
      border-radius: 2rem
      padding: 0.75rem 2rem
      background-color: var(--white)
    .oval
      width: 0.75rem
      height: 0.75rem
      background-color: var(--greenblue)
      display: inline-block
      border-radius: 0.5rem
      margin-right: 0.5rem
`)
