import React, { Component } from 'react'
import { Query } from 'react-apollo'
import gql from 'graphql-tag'

import Link from 'components/Link'
import Redirect from 'components/Redirect'
import Modal from 'components/Modal'
import Steps from 'components/Steps'

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
    <div className="help mb">
      You’ve rejected our request to turn on desktop notifications which we{' '}
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
    const { listing } = this.props
    const linkPrefix = listing ? `/listing/${listing.id}` : ''
    const nextLink = `${linkPrefix}/onboard/profile`
    if (this.state.redirect || this.state.permission === 'unavailable') {
      return <Redirect to={nextLink} />
    }
    return (
      <>
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
                  <button
                    className="btn btn-outline-primary"
                    onClick={() => this.setState({ modal: true })}
                  >
                    Continue
                  </button>
                )
                let cmp
                if (this.state.permission === 'granted') {
                  cmp = <Enabled />
                  continueBtn = (
                    <Link className="btn btn-primary" to={nextLink}>
                      Continue
                    </Link>
                  )
                } else if (this.state.permission === 'denied') {
                  cmp = <Denied />
                  continueBtn = (
                    <Link className="btn btn-outline-primary" to={nextLink}>
                      Continue
                    </Link>
                  )
                } else if (this.state.permissionRequested) {
                  cmp = <WaitEnableNotifications />
                } else {
                  cmp = (
                    <EnableNotifications
                      next={() => this.requestPermission()}
                    />
                  )
                }

                return (
                  <>
                    {cmp}
                    <div className="continue-btn">{continueBtn}</div>

                    {this.state.modal && (
                      <Modal
                        shouldClose={this.state.shouldClose}
                        onClose={() =>
                          this.setState({ modal: false, shouldClose: false })
                        }
                      >
                        <div className="notifications-modal">
                          <div className="no-notifications-logo">!</div>
                          <h5>Wait! Don’t you want updates?</h5>
                          <div>
                            Not having desktop notifications increases the
                            chances of missing important updates about your
                            transactions.
                          </div>
                          <button
                            className="btn btn-success"
                            onClick={() => this.requestPermission()}
                          >
                            Wait! I want updates
                          </button>
                          <button
                            className="btn btn-link"
                            onClick={() => this.setState({ redirect: true })}
                          >
                            No, I don’t want to receive updates
                          </button>
                        </div>
                      </Modal>
                    )}
                    {/* <pre>{JSON.stringify(data, null, 4)}</pre> */}
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
      this.setState({ permission })
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
      width: 10rem
      height: 10rem
      background: url(images/notifications-computer.svg) no-repeat center
      background-size: 100%
      position: relative
      .qm
        bottom: 1rem
        right: 2rem
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
