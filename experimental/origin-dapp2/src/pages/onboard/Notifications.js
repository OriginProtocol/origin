import React, { Component } from 'react'
import { Query } from 'react-apollo'
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
  }
`

const EnableNotifications = ({ next }) => (
  <div className="onboard-box">
    <div className="notifications-logo">
      <div className="qm" />
    </div>
    <div className="status">
      Desktop Notifications
      <i>(highly recommended)</i>
    </div>
    <div className="help">
      Native desktop notifications will allow you to stay on top of what you
      need to do on the Origin DApp
    </div>
    <em>
      Click the button below then click confirm the request on the native
      browser dialog that will appear above.
    </em>
    <button className="btn btn-primary" onClick={() => next()}>
      Turn on Notifications
    </button>
  </div>
)

const WaitEnableNotifications = ({ next }) => (
  <div className="onboard-box">
    <div className="notifications-logo">
      <div className="qm" />
    </div>
    <div className="status">Waiting for you to grant permission</div>
    <div className="help">
      The native browser permissions dialog opens at the top of the browser
      window. Please confirm the request
    </div>
    <div className="spinner" onClick={() => next()} />
  </div>
)

const Enabled = ({ next }) => (
  <div className="onboard-box">
    <div className="notifications-logo">
      <div className="qm active" />
    </div>
    <div className="status">Desktop Notifications Enabled</div>
    <div className="help">
      Great! It will be much easier for you to respond quickly to requests from
      buyers and sellers.
    </div>
    <em>Click the continue button below to proceed.</em>
    <Link to={next} className="btn btn-primary">
      Continue
    </Link>
  </div>
)

class OnboardNotifications extends Component {
  state = { step: 1 }
  render() {
    const { listing } = this.props
    const { step } = this.state
    return (
      <>
        <div className="step">Step 3</div>
        <h3>Turn On Desktop Notifications</h3>
        <div className="row">
          <div className="col-md-8">
            <Stage stage={3} />
            <Query query={query} notifyOnNetworkStatusChange={true}>
              {({ error, data, networkStatus }) => {
                if (networkStatus === 1) {
                  return <div>Loading...</div>
                } else if (error) {
                  return <p className="p-3">Error :(</p>
                } else if (!data || !data.web3) {
                  return <p className="p-3">No Web3</p>
                }

                const nextLink = `/listings/${listing.id}/onboard/profile`

                return (
                  <>
                    {step === 1 ? (
                      <EnableNotifications
                        next={() => this.setState({ step: 2 })}
                      />
                    ) : null}
                    {step === 2 ? (
                      <WaitEnableNotifications
                        next={() => this.setState({ step: 3 })}
                      />
                    ) : null}
                    {step === 3 ? <Enabled next={nextLink} /> : null}
                    <pre>{JSON.stringify(data, null, 4)}</pre>
                  </>
                )
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

export default OnboardNotifications

require('react-styl')(`
  .onboard .onboard-box
    .notifications-logo
      margin-top: -2rem
      width: 10rem
      height: 10rem
      background: url(images/notifications-computer.svg) no-repeat center
      background-size: 100%
      position: relative
      .qm
        bottom: 1rem
        right: 2rem

`)
