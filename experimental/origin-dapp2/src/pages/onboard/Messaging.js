import React, { Component } from 'react'
import { Query, Mutation } from 'react-apollo'
import gql from 'graphql-tag'

import Link from 'components/Link'

import ListingPreview from './_ListingPreview'
import Stage from './_Stage'
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
    <div className="status">Origin Messaging</div>
    <div className="spinner" />
  </div>
)

const EnableMessaging = ({ next }) => (
  <div className="onboard-box">
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
          className="btn btn-outline-primary"
          onClick={() => {
            next()
            enableMessaging()
          }}
          children="Enable Origin Messaging"
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

const MessagingEnabled = ({ next }) => (
  <div className="onboard-box">
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
    <Link to={next} className="btn btn-outline-primary">
      Continue
    </Link>
  </div>
)

class OnboardMessaging extends Component {
  state = {}
  render() {
    const { listing } = this.props
    return (
      <>
        <div className="step">Step 2</div>
        <h3>Enable Messaging</h3>
        <div className="row">
          <div className="col-md-8">
            <Stage stage={2} />
            <Query query={query} notifyOnNetworkStatusChange={true}>
              {({ error, data, networkStatus }) => {
                if (networkStatus === 1) {
                  return <MessagingInitializing />
                } else if (error) {
                  return <p className="p-3">Error :(</p>
                } else if (!data || !data.web3) {
                  return <p className="p-3">No Web3</p>
                }

                const nextLink = `/listings/${listing.id}/onboard/notifications`

                let cmp
                if (!data.messaging.enabled && !this.state.waitForSignature) {
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
                  cmp = <MessagingEnabled next={nextLink} />
                }

                return cmp

                // return (
                //   <>
                //     {cmp}
                //     <pre>{JSON.stringify(data, null, 4)}</pre>
                //   </>
                // )
              }}
            </Query>
          </div>
          <div className="col-md-4">
            <ListingPreview listing={listing} />
            <HelpMessaging />
          </div>
        </div>
      </>
    )
  }
}

export default OnboardMessaging

require('react-styl')(`
  .onboard-box
    .messaging-logo
      margin-bottom: 1rem
      width: 6.5rem
      height: 6.5rem
      border-radius: 1rem
      background: var(--dusk) url(images/messages-icon.svg) no-repeat center
      background-size: 3.5rem
      position: relative
`)
