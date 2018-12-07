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

const Denied = () => (
  <div className="onboard-box">
    <div className="notifications-logo">
      <div className="qm error" />
    </div>
    <div className="status">Uh oh, there’s a problem...</div>
    <div className="help mb">
      You’ve rejected our request to turn on desktop notifications which we{' '}
      <b>highly recommend</b>.
    </div>
    <div className="help mb">
      In order to fix this, please go into your browser settings and turn on
      notifications for our DApp.
    </div>
    <a href="#" className="cancel big">
      Visit Browser Settings
    </a>
  </div>
)

class OnboardNotifications extends Component {
  state = { permission: Notification.permission }
  render() {
    const { listing } = this.props
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

                let cmp
                if (this.state.permission === 'granted') {
                  cmp = <Enabled next={nextLink} />
                } else if (this.state.permission === 'denied') {
                  cmp = <Denied next={nextLink} />
                } else if (this.state.permissionRequested) {
                  cmp = (
                    <WaitEnableNotifications
                      next={() => this.setState({ step: 3 })}
                    />
                  )
                } else {
                  cmp = (
                    <EnableNotifications
                      next={() => {
                        this.setState({ permissionRequested: true })
                        Notification.requestPermission().then(permission => {
                          this.setState({ permission })
                          if (permission === 'granted') {
                            this.showNotification()
                          }
                        })
                      }}
                    />
                  )
                }

                return cmp
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

  showNotification() {
    new Notification('Sweet! Desktop notifications are on :)', {
      icon: 'images/app-icon.png'
    })
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
