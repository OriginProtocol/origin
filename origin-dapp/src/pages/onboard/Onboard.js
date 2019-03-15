import React, { Component } from 'react'
import { Switch, Route, Redirect } from 'react-router-dom'

import store from 'utils/store'

import Wallet from './Wallet'
import MetaMask from './MetaMask'
import { Messaging } from './Messaging'
import Notifications from './Notifications'
import Profile from './Profile'
import Finished from './Finished'

const sessionStore = store('sessionStorage')

class Onboard extends Component {
  render() {
    const { listing, showoriginwallet, linkprefix, redirectTo } = this.props
    const linkPathPrefix = linkprefix || (listing ? '/listing/:listingID' : '')
    const linkPrefix = linkprefix || (listing ? `/listing/${listing.id}` : '')

    return (
      <div className="container onboard">
        <Switch>
          <Route
            path={`${linkPathPrefix}/onboard/metamask`}
            render={() => (
              <MetaMask listing={listing} linkPrefix={linkPrefix} />
            )}
          />
          <Route
            path={`${linkPathPrefix}/onboard/messaging`}
            render={() => (
              <Messaging listing={listing} linkPrefix={linkPrefix} />
            )}
          />
          <Route
            path={`${linkPathPrefix}/onboard/notifications`}
            render={() => (
              <Notifications listing={listing} linkPrefix={linkPrefix} />
            )}
          />
          <Route
            path={`${linkPathPrefix}/onboard/profile`}
            render={() => <Profile listing={listing} linkPrefix={linkPrefix} />}
          />
          <Route
            path={`${linkPathPrefix}/onboard/finished`}
            render={() => (
              <Finished redirectto={redirectTo} linkPrefix={linkPrefix} />
            )}
          />
          <Redirect
            from={`${linkPathPrefix}/onboard/back`}
            to={sessionStore.get('getStartedRedirect', '/')}
          />
          <Route
            render={() => (
              <Wallet
                listing={listing}
                linkPrefix={linkPrefix}
                // Growth engine does not support Origin Wallet for now
                showoriginwallet={showoriginwallet}
              />
            )}
          />
        </Switch>
      </div>
    )
  }
}

export default Onboard

require('react-styl')(`
  .onboard
    margin-top: 3.5rem
    .btn
      border-radius: 2rem
      padding: 0.75rem 2rem
      margin-bottom: 1rem
      min-width: 10rem
      font-size: 18px
    h2
      font-family: var(--heading-font)
      font-size: 40px
      font-weight: 200
      font-style: normal
      color: var(--dark)
      margin-bottom: 0.75rem
    .explanation
      margin-bottom: 2.5rem
    .step
      font-family: var(--default-font)
      font-size: 14px
      color: var(--dusk)
      font-weight: normal
      text-transform: uppercase
      margin-top: 0.75rem
    h3
      font-family: var(--heading-font)
      font-size: 28px
      font-weight: 300
      font-style: normal
      color: var(--dark)
      margin-bottom: 0.75rem

    .listing-preview,.onboard-help
      background: var(--pale-grey-eight)
      border-radius: var(--default-radius)
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

    .spinner
      margin: 2rem 0
    .continue-btn
      margin-top: 2rem
      text-align: right
      .btn.disabled
        opacity: 0.25

  .onboard-box
    border: 1px solid var(--light)
    border-radius: var(--default-radius)
    padding: 8rem 2rem
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

  .spinner
    background: url(images/spinner-animation-dark.svg) no-repeat center
    background-size: contain
    width: 4rem
    height: 4rem
    &.light
      background-image: url(images/spinner-animation-light.svg)

  .error-icon
    background: url(images/flat-cross-icon.svg) no-repeat center
    background-size: contain
    height: 3.5rem

  @media (max-width: 767.98px)
    .onboard
      margin-top: 1.5rem
      h2
        line-height: 1.25
      h3
        line-height: 1.25
        font-size: 24px
        margin-bottom: 0
      .step
        font-size: 12px
`)
