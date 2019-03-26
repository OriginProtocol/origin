import React, { Component } from 'react'
import { Query } from 'react-apollo'
import gql from 'graphql-tag'

import Link from 'components/Link'
import Redirect from 'components/Redirect'
import Steps from 'components/Steps'

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
  }
`

const EnableNotifications = ({ next, skip }) => (
  <div className="onboard-box">
    <div className="notifications-logo" />
    <div className="status">Desktop Notifications</div>
    <div className="connected">
      <span className="oval warn" />
      Notifications are turned off
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
    <button className="btn btn-link" onClick={() => skip()}>
      Skip for now
    </button>
  </div>
)

const Skipped = ({ next }) => (
  <div className="onboard-box">
    <div className="notifications-logo" />
    <div className="status">Wait! Don’t you want updates?</div>
    <div className="help">
      Not having desktop notifications increases the chances of missing
      important updates about your transactions.
    </div>
    <button className="btn btn-primary mt-4" onClick={() => next()}>
      Turn on Notifications
    </button>
  </div>
)

const WaitEnableNotifications = () => (
  <div className="onboard-box">
    <div className="notifications-logo">
      <div className="qm" />
    </div>
    <div className="status">Waiting for you to grant permission</div>
    <div className="help">
      The native browser permissions dialog opens at the top of the browser
      window. Please confirm the request
    </div>
    <div className="spinner" />
  </div>
)

const Enabled = () => (
  <div className="onboard-box">
    <div className="notifications-logo">
      <div className="qm active" />
    </div>
    <div className="status">Desktop Notifications Enabled</div>
    <div className="connected">
      <span className="oval" />
      Notifications are turned on
    </div>
    <div className="help">
      Great! It will be much easier for you to respond quickly to requests from
      buyers and sellers.
    </div>
    <em>Click the continue button below to proceed.</em>
  </div>
)

const Denied = () => (
  <div className="onboard-box">
    <div className="notifications-logo">
      <div className="qm error" />
    </div>
    <div className="status">Uh oh, there’s a problem...</div>
    <div className="connected">
      <span className="oval danger" />
      Notifications are turned off
    </div>
    <div className="help mb">
      You’ve rejected our request to turn on desktop notifications which we
      <b>highly recommend</b>.
    </div>
    <div className="help mb">
      In order to fix this, please go into your browser settings and turn on
      notifications for our DApp.
    </div>
    <button className="btn btn-link cancel big">Visit Browser Settings</button>
  </div>
)

class OnboardNotifications extends Component {
  state = {
    permission:
      typeof Notification === 'undefined'
        ? 'unavailable'
        : Notification.permission
  }
  render() {
    const { listing, linkPrefix } = this.props

    const nextLink = `${linkPrefix}/onboard/profile`
    if (this.state.redirect || this.state.permission === 'unavailable') {
      return <Redirect to={nextLink} />
    }
    return (
      <>
        <Header />
        <div className="step">Step 3</div>
        <h3>Turn On Desktop Notifications</h3>
        <div className="row">
          <div className="col-md-8">
            <Steps steps={4} step={3} />
            <Query query={query} notifyOnNetworkStatusChange={true}>
              {({ error, data, networkStatus }) => {
                if (networkStatus === 1) {
                  return <div>Loading...</div>
                } else if (error) {
                  return <p className="p-3">Error :(</p>
                } else if (!data || !data.web3) {
                  return <p className="p-3">No Web3</p>
                }

                let continueBtn = (
                  <Link className="btn btn-outline-primary " to={nextLink}>
                    Continue
                  </Link>
                )
                let cmp
                if (this.state.skipped) {
                  cmp = <Skipped next={() => this.requestPermission()} />
                } else if (this.state.permission === 'granted') {
                  cmp = <Enabled />
                } else if (this.state.permission === 'denied') {
                  cmp = <Denied />
                } else if (this.state.permissionRequested) {
                  cmp = <WaitEnableNotifications />
                } else {
                  cmp = (
                    <EnableNotifications
                      next={() => this.requestPermission()}
                      skip={() => this.setState({ skipped: true })}
                    />
                  )
                  continueBtn = (
                    <a
                      href="#"
                      onClick={e => e.preventDefault()}
                      className="btn btn-outline-primary disabled"
                      children={fbt("Continue", "Continue")}
                    />
                  )
                }

                return (
                  <>
                    {cmp}
                    <div className="continue-btn">{continueBtn}</div>
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

  requestPermission() {
    if (typeof Notification == 'undefined') return
    this.setState({ permissionRequested: true, shouldClose: true })
    Notification.requestPermission().then(permission => {
      if (permission === 'default') {
        this.setState({ permissionRequested: false })
      } else {
        this.setState({ permission })
      }

      if (permission === 'granted') {
        this.showNotification()
      }
    })
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
      width: 9rem
      height: 10rem
      background: url(images/notifications-graphic.svg) no-repeat center
      background-size: 100%
      position: relative
      .qm
        bottom: 1rem
        right: 0rem
  .notifications-modal
    display: flex;
    flex-direction: column;
    align-items: center;
    .no-notifications-logo
      width: 10rem
      height: 10rem
      margin-bottom: 2rem
      background: url(images/alerts-icon.svg) no-repeat center
      background-size: contain
      color: black
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 4rem;
      font-family: var(--heading-font);
    .btn-success
      margin-top: 2rem
    .btn-link
      margin-top: 1rem

`)
