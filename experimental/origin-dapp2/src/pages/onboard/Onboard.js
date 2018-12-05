import React, { Component } from 'react'
import { Switch, Route } from 'react-router-dom'

import OnboardWallet from './Wallet'
import OnboardMetaMask from './MetaMask'
import OnboardMessaging from './Messaging'

class Onboard extends Component {
  render() {
    const { listing } = this.props

    return (
      <div className="onboard">
        <h2>Getting started on Origin</h2>
        <div className="explanation">
          In order to successfully transact with others on our DApp, you’ll need
          a few things before you get started.{' '}
          <a href="#">Why do I need to do this?</a>
        </div>

        <Switch>
          <Route
            path="/listings/:listingID/onboard/metamask"
            render={() => <OnboardMetaMask listing={listing} />}
          />
          <Route
            path="/listings/:listingID/onboard/messaging"
            render={() => <OnboardMessaging listing={listing} />}
          />
          <Route render={() => <OnboardWallet listing={listing} />} />
        </Switch>
      </div>
    )
  }
}

export default Onboard

require('react-styl')(`
  .onboard
    margin-top: 2.5rem
    h2
      font-family: Poppins
      font-size: 40px
      font-weight: 200
      font-style: normal
      color: var(--dark)
    .explanation
      margin-bottom: 2.5rem
    .step
      font-family: Lato
      font-size: 14px
      color: var(--dusk)
      font-weight: normal
      text-transform: uppercase
      margin-top: 0.75rem
    h3
      font-family: Poppins
      font-size: 28px
      font-weight: 300
      font-style: normal
      color: var(--dark)
      margin-bottom: 0.75rem
    .stages
      display: flex
      margin-bottom: 1.5rem
      .stage
        flex: 1
        height: 2px
        background: var(--pale-grey-two)
        margin-right: 2px
        border-radius: 2px
        &.active
          background: var(--clear-blue)

    .listing-preview,.onboard-help
      background: var(--pale-grey-eight)
      border-radius: 5px
      padding: 1rem
      margin-bottom: 2rem
      font-size: 16px
      h4
        font-size: 16px
        margin-bottom: 1rem
      .listing-card
        margin: 0
    .onboard-help
      padding: 2rem
      .learn-more
        margin-top: 1rem

`)
