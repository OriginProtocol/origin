import React, { Component } from 'react'
import { withRouter } from 'react-router-dom'
import { Query, Mutation } from 'react-apollo'
import gql from 'graphql-tag'
import store from 'utils/store'

import Link from 'components/Link'
import EnableMessagingMutation from 'mutations/EnableMessaging'

const sessionStore = store('sessionStorage')

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

const MessagingInitializing = () => (
  <div className="enable-messaging">
    <div className="messaging-logo" />
    <div className="status">Origin Messaging</div>
    <div className="spinner" />
  </div>
)

const Onboard = withRouter(({ location }) => (
  <div className="message-modal">
    <div>
      You&apos;ll need Get Started using Origin before you can send this user a
      message
    </div>
    <div className="actions">
      <Link
        to="/onboard"
        className="btn btn-primary"
        onClick={() => {
          const { pathname, search } = location
          sessionStore.set('getStartedRedirect', { pathname, search })
        }}
      >
        Get Started
      </Link>
    </div>
  </div>
))

const MessagingSyncing = ({ pct }) => (
  <div className="enable-messaging messaging-sync">
    <div className="messaging-logo" />
    <div className="status">Origin Messaging Syncing</div>
    <div className="progress">
      <div className="progress-bar" style={{ width: pct }} />
    </div>
  </div>
)

const EnableMessaging = ({ next }) => (
  <div className="enable-messaging">
    <div className="messaging-logo">
      <div className="qm" />
      <div className="qm" />
    </div>
    <div className="status">Origin Messaging</div>
    <div className="help">
      Origin messaging will allow you to chat with other buyers and sellers on
      our DApp.
    </div>
    <em>Metamask will ask you to sign 2 messages</em>
    <Mutation mutation={EnableMessagingMutation}>
      {enableMessaging => (
        <button
          className="btn btn-primary"
          onClick={() => {
            next()
            enableMessaging()
          }}
          children="Enable Origin Messaging"
        />
      )}
    </Mutation>
  </div>
)

const SignMessage = ({ num }) => (
  <div className="enable-messaging">
    <div className="messaging-logo">
      <div className="qm" />
      <div className={`qm${num === 2 ? ' active' : ''}`} />
    </div>
    <div className="status">{`Waiting for you to sign message #${num}`}</div>
    <div className="help">
      The Metamask icon is located on the top right of your browser tool bar.
    </div>
    <div className="click-metamask-extension" />
  </div>
)

const MessagingEnabled = () => (
  <div className="enable-messaging">
    <div className="messaging-logo">
      <div className="qm active" />
      <div className="qm active" />
    </div>
    <div className="status">Messaging Enabled</div>
    <div className="help">
      Congratulations! You can now message other users on Origin and stay up to
      date with all your purchases and sales.
    </div>
    <em>You’re done and can continue by pressing the button below.</em>
  </div>
)

class EnableMessagingModal extends Component {
  state = {}
  render() {
    return (
      <Query query={query} notifyOnNetworkStatusChange={true}>
        {({ data, error, networkStatus }) => {
          if (networkStatus === 1) {
            return <MessagingInitializing />
          } else if (error) {
            return <p className="p-3">Error :(</p>
          } else if (!data || !data.web3) {
            return <p className="p-3">No Web3</p>
          }

          let cmp
          if (!data.messaging) {
            cmp = <Onboard />
          } else if (!data.messaging.synced) {
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
            cmp = <MessagingEnabled />
          }

          return cmp
        }}
      </Query>
    )
  }
}

export default EnableMessagingModal

require('react-styl')(`
  .enable-messaging
    display: flex
    flex-direction: column
    align-items: center
    text-align: center
    .status
      font-family: var(--heading-font)
      font-size: 24px
      font-weight: 300
      margin: 2rem 0 0.5rem 0
      &.mb
        margin-bottom: 4rem
      i
        font-size: 20px
        display: block
        margin-bottom: 1rem
    .help.mb
      margin-bottom: 2rem
    em
      font-weight: normal
      margin-top: 1rem
      margin-bottom: 2rem
    a.cancel
      font-size: 14px
      font-weight: normal
      margin-top: 1rem
      &.big
        font-size: 18px
        font-weight: 900
    .qm
      width: 2rem
      height: 2rem
      background: var(--golden-rod)
      position: absolute
      border-radius: 2rem
      bottom: -0.75rem
      right: -2rem
      color: white
      font-weight: 700
      font-size: 1.5rem
      line-height: 2rem
      &::after
        content: "?"
      &:nth-child(2)
        right: 0.25rem
      &.active
        background: var(--greenblue) url(images/checkmark-white.svg) no-repeat center
        background-size: 1.2rem
        &::after
          content: ""
      &.error
        background: var(--orange-red)
        font-size: 2.2rem
        line-height: 1.8rem
        &::after
          content: "×"

    .messaging-logo
      margin-bottom: 1rem
      width: 6.5rem
      height: 6.5rem
      border-radius: 1rem
      background: var(--dusk) url(images/messages-icon.svg) no-repeat center
      background-size: 3.5rem
      position: relative
`)
