import React, { Component } from 'react'
import { Query } from 'react-apollo'
import gql from 'graphql-tag'
import { fbt } from 'fbt-runtime'

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
      <fbt desc="onboard.Notifications.turnedOff">
        Notifications are turned off
      </fbt>
    </div>
    <div className="help">
      <fbt desc="onboard.Notifications.help">
        Native desktop notifications will allow you to stay on top of what you
        need to do on the Origin DApp
      </fbt>
    </div>
    <em>
      <fbt desc="onboard.Notifications.clickAndConfirm">
        Click the button below then click confirm the request on the native
        browser dialog that will appear above.
      </fbt>
    </em>
    <button className="btn btn-primary" onClick={() => next()}>
      <fbt desc="onboard.Notifications.turnOn">Turn on Notifications</fbt>
    </button>
    <button className="btn btn-link" onClick={() => skip()}>
      <fbt desc="skip">Skip for now</fbt>
    </button>
  </div>
)

const Skipped = ({ next }) => (
  <div className="onboard-box">
    <div className="notifications-logo" />
    <div className="status">Wait! Don’t you want updates?</div>
    <div className="help">
      <fbt desc="onboard.Notifications.notHavingNotificationsImpact">
        Not having desktop notifications increases the chances of missing
        important updates about your transactions.
      </fbt>
    </div>
    <button className="btn btn-primary mt-4" onClick={() => next()}>
      <fbt desc="onboard.Notifications.turnOn">Turn on Notifications</fbt>
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
      <fbt desc="onboard.Notifications.confirmRequest">
        The native browser permissions dialog opens at the top of the browser
        window. Please confirm the request
      </fbt>
    </div>
    <div className="spinner" />
  </div>
)

const Enabled = () => (
  <div className="onboard-box">
    <div className="notifications-logo">
      <div className="qm active" />
    </div>
    <div className="status">
      <fbt desc="onboard.Notifications.notificationsEnabled">
        Desktop Notifications Enabled
      </fbt>
    </div>
    <div className="connected">
      <span className="oval" />
      <fbt desc="onboard.Notifications.areTurnedOn">
        Notifications are turned on
      </fbt>
    </div>
    <div className="help">
      <fbt desc="onboard.Notifications.turnedOnHelp">
        Great! It will be much easier for you to respond quickly to requests
        from buyers and sellers.
      </fbt>
    </div>
    <em>
      <fbt desc="onboard.Notifications.proceed">
        Click the continue button below to proceed.
      </fbt>
    </em>
  </div>
)

const Denied = () => (
  <div className="onboard-box">
    <div className="notifications-logo">
      <div className="qm error" />
    </div>
    <div className="status">
      <fbt desc="onboard.Notifications.problem">
        Uh oh, there’s a problem...
      </fbt>
    </div>
    <div className="connected">
      <span className="oval danger" />
      <fbt desc="onboard.Notifications.areTurnedOff">
        Notifications are turned off
      </fbt>
    </div>
    <div className="help mb">
      <fbt desc="onboard.Notifications.youRejected">
        You’ve rejected our request to turn on desktop notifications which we{' '}
        <b>highly recommend</b>.
      </fbt>
    </div>
    <div className="help mb">
      <fbt desc="onboard.Notifications.fixIt">
        In order to fix this, please go into your browser settings and turn on
        notifications for our DApp.
      </fbt>
    </div>
    <button className="btn btn-link cancel big">
      <fbt desc="onboard.Notifications.visitBrowserSettings">
        Visit Browser Settings
      </fbt>
    </button>
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
                  return (
                    <div>
                      <fbt desc="onboard.Notifications.loading">Loading...</fbt>
                    </div>
                  )
                } else if (error) {
                  return (
                    <p className="p-3">
                      <fbt desc="error">Error</fbt> :(
                    </p>
                  )
                } else if (!data || !data.web3) {
                  return (
                    <p className="p-3">
                      <fbt desc="onboard.Notifications.noWeb3">No Web3</fbt>
                    </p>
                  )
                }

                let continueBtn = (
                  <Link className="btn btn-outline-primary " to={nextLink}>
                    <fbt desc="continue">Continue</fbt>
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
                      children="{fbt('Continue', 'continue')}"
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
    new Notification(
      fbt(
        'Sweet! Desktop notifications are on :)',
        'onboard.Notifications.areOn'
      ),
      {
        icon: 'images/app-icon.png'
      }
    )
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
