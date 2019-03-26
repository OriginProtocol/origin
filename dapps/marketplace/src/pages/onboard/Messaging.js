import React, { Component } from 'react'
import { Query, Mutation } from 'react-apollo'
import gql from 'graphql-tag'
import { fbt } from 'fbt-runtime'

import Link from 'components/Link'
import Steps from 'components/Steps'
import MetaMaskAnimation from 'components/MetaMaskAnimation'

import Header from './_Header'
import ListingPreview from './_ListingPreview'
import HelpMessaging from './_HelpMessaging'

const query = gql`
  query WalletStatus {
    web3 {
      metaMaskAccount {
        id
      }
    }
    messaging(id: "defaultAccount") {
      id
      pubKey
      pubSig
      enabled
      synced
      syncProgress
    }
  }
`

const EnableMessagingMutation = gql`
  mutation EnableMessaging {
    enableMessaging
  }
`

const MessagingInitializing = () => (
  <div className="onboard-box">
    <div className="messaging-logo" />
    <div className="status">
      <fbt desc="onboard.Messaging.originMessaging">Origin Messaging</fbt>
    </div>
    <div className="spinner" />
  </div>
)

const MessagingSyncing = ({ pct }) => (
  <div className="onboard-box messaging-sync">
    <div className="messaging-logo" />
    <div className="status">
      <fbt desc="onboard.Messaging.syncing">Origin Messaging Syncing</fbt>
    </div>
    <div className="progress">
      <div className="progress-bar" style={{ width: pct }} />
    </div>
  </div>
)

const EnableMessaging = ({ next }) => (
  <div className="onboard-box">
    <div className="messaging-logo" />
    <div className="status">Origin Messaging</div>
    <div className="connected">
      <span className="oval warn" />
      <span className="oval warn" />
      <fbt desc="onboard.Messaging.zeroOfTwoSigned">
        {' '}
        0 of 2 MetaMask messages signed
      </fbt>
    </div>

    <div className="help mb">
      <fbt desc="onboard.Messaging.capabilities">
        Messaging will allow you to chat with other buyers and sellers.
      </fbt>
    </div>
    <Mutation mutation={EnableMessagingMutation}>
      {enableMessaging => (
        <button
          className="btn btn-outline-primary"
          onClick={() => {
            next()
            enableMessaging()
          }}
          children={fbt('Enable Origin Messaging', 'Enable Origin Messaging')}
        />
      )}
    </Mutation>

    <a href="#" className="cancel">
      Tell me more
    </a>
  </div>
)

const SignMessage = ({ num }) => (
  <div className="onboard-box">
    <MetaMaskAnimation light />
    <div className="status">
      <fbt desc="onboard.Messaging.waitingOnSigning">
        Waiting for you to sign message number{' '}
        <fbt:param name="messageNumber">{num}</fbt:param>
      </fbt>
    </div>
    <div className="connected">
      <span className={`oval ${num === 2 ? '' : 'warn'}`} />
      <span className={`oval warn`} />
      <fbt desc="onboard.Messaging.signedNumMessages">
        <fbt:param name="messageNumber">{num === 2 ? '1' : '0'}</fbt:param> of 2
        MetaMask messages signed
      </fbt>
    </div>

    <div className="help">
      <fbt desc="onboard.Messaging.metamaskIcon">
        The Metamask icon is located on the top right of your browser tool bar.
      </fbt>
    </div>
    <div className="click-metamask-extension" />
  </div>
)

const MessagingEnabled = () => (
  <div className="onboard-box">
    <div className="messaging-logo">
      <div className="qm active" />
    </div>
    <div className="status">
      <fbt desc="onboard.Messaging.enabled">Messaging Enabled</fbt>
    </div>
    <div className="connected">
      <span className="oval" />
      <span className="oval" />
      <fbt desc="onboard.Messaging.TwoOfTwoSigned">
        {' '}
        2 of 2 MetaMask messages signed
      </fbt>
    </div>
    <div className="help">
      <fbt desc="onboard.Messaging.congrats">
        Congratulations! You can now message other users on Origin and stay up
        to date with all your purchases and sales.
      </fbt>
    </div>
    <em>
      <fbt desc="onboard.Messaging.done">
        You’re done and can continue by pressing the button below.
      </fbt>
    </em>
  </div>
)

class OnboardMessaging extends Component {
  state = {}
  render() {
    const { nextLink } = this.props
    return (
      <Query query={query} notifyOnNetworkStatusChange={true}>
        {({ data, error, networkStatus }) => {
          if (networkStatus === 1) {
            return <MessagingInitializing />
          } else if (error) {
            return (
              <p className="p-3">
                <fbt desc="Error">Error</fbt>
              </p>
            )
          } else if (!data || !data.messaging) {
            return (
              <p className="p-3">
                <fbt desc="No Web3">No Web3</fbt>
              </p>
            )
          }

          let nextEnabled = false

          let cmp
          if (!data.messaging.synced) {
            cmp = <MessagingSyncing pct={data.messaging.syncProgress} />
          } else if (!data.messaging.enabled && !this.state.waitForSignature) {
            cmp = (
              <EnableMessaging
                next={() => this.setState({ waitForSignature: true })}
              />
            )
          } else if (!data.messaging.pubKey) {
            cmp = <SignMessage num={1} />
          } else if (!data.messaging.pubSig) {
            cmp = <SignMessage num={2} />
          } else {
            nextEnabled = true
            cmp = <MessagingEnabled />
          }

          return (
            <>
              {cmp}
              <div className="continue-btn">
                {nextLink && (
                  <Link
                    to={nextLink}
                    className={`btn btn-primary${
                      nextEnabled ? '' : ' disabled'
                    }`}
                  >
                    Continue
                  </Link>
                )}
              </div>
            </>
          )
        }}
      </Query>
    )
  }
}

const Messaging = ({ listing, linkPrefix }) => {
  return (
    <>
      <Header />
      <div className="step">Step 2</div>
      <h3>
        <fbt desc="onboard.Messaging.enableMessaging">Enable Messaging</fbt>
      </h3>
      <div className="row">
        <div className="col-md-8">
          <Steps steps={4} step={2} />
          <OnboardMessaging nextLink={`${linkPrefix}/onboard/notifications`} />
        </div>
        <div className="col-md-4">
          <ListingPreview listing={listing} />
          <HelpMessaging />
        </div>
      </div>
    </>
  )
}

export { Messaging, OnboardMessaging }

require('react-styl')(`
  .onboard-box
    .messaging-logo
      margin-bottom: 1rem
      width: 10rem
      height: 10rem
      background: url(images/chat-bubble-icon.svg) no-repeat center
      background-size: contain
      position: relative
      .qm.active
        background-size: 2rem;
        width: 3.5rem
        height: 3.5rem
        right: -1.5rem
  .messaging-sync > .progress
    width: 50%
    margin-top: 2rem
`)
