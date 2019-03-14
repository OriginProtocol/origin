import React, { Component } from 'react'
import { Mutation } from 'react-apollo'
import get from 'lodash/get'
import { withRouter } from 'react-router-dom'
import store from 'utils/store'
const sessionStore = store('sessionStorage')

import MakeOfferMutation from 'mutations/MakeOffer'
import SwapToTokenMutation from 'mutations/SwapToToken'

import Modal from 'components/Modal'
import TransactionError from 'components/TransactionError'
import WaitForTransaction from 'components/WaitForTransaction'
import Redirect from 'components/Redirect'
import withCanTransact from 'hoc/withCanTransact'
import withWallet from 'hoc/withWallet'
import withWeb3 from 'hoc/withWeb3'

class Buy extends Component {
  state = {}
  render() {
    if (this.state.onboard) {
      return <Redirect to={`/listing/${this.props.listing.id}/onboard`} />
    }
    const tokenStatus = this.props.tokenStatus || {}
    let cmp
    if (tokenStatus.hasBalance) {
      cmp = this.renderMakeOfferMutation()
    } else {
      cmp = this.renderSwapTokenModal()
    }

    return (
      <>
        {cmp}
        {this.state.error && (
          <TransactionError
            reason={this.state.error}
            data={this.state.errorData}
            onClose={() => this.setState({ error: false })}
          />
        )}
      </>
    )
  }

  renderSwapTokenModal() {
    return (
      <>
        <button
          className={this.props.className}
          onClick={() => this.setState({ swap: true })}
          children={this.props.children}
        />
        {!this.state.swap ? null : (
          <Modal
            onClose={() =>
              this.setState({ swap: false, swapShouldClose: false })
            }
            shouldClose={this.state.swapShouldClose}
          >
            <h2>Swap for DAI</h2>
            Click below to swap ETH for DAI
            <div className="actions">
              <button
                className="btn btn-outline-light"
                onClick={() => this.setState({ swapShouldClose: true })}
                children="Cancel"
              />
              {this.renderSwapTokenMutation()}
            </div>
          </Modal>
        )}
      </>
    )
  }

  renderSwapTokenMutation() {
    return (
      <Mutation
        mutation={SwapToTokenMutation}
        onCompleted={({ swapToToken }) => {
          this.setState({ waitForSwap: swapToToken.id })
        }}
        onError={errorData =>
          this.setState({ waitForSwap: false, error: 'mutation', errorData })
        }
      >
        {swapToToken => (
          <>
            <button
              className={this.props.className}
              onClick={() => this.onSwapToToken(swapToToken)}
              children="Start Swap"
            />
            {this.renderWaitSwapModal()}
          </>
        )}
      </Mutation>
    )
  }

  renderMakeOfferMutation() {
    return (
      <Mutation
        mutation={MakeOfferMutation}
        onCompleted={({ makeOffer }) => {
          this.setState({ waitFor: makeOffer.id })
        }}
        onError={errorData =>
          this.setState({ waitFor: false, error: 'mutation', errorData })
        }
      >
        {makeOffer => (
          <>
            <button
              className={this.props.className}
              onClick={() => this.onClick(makeOffer)}
              children={this.props.children}
            />
            {this.renderWaitModal()}
          </>
        )}
      </Mutation>
    )
  }

  onClick(makeOffer) {
    if (!this.canTransact()) {
      return
    }

    this.setState({ waitFor: 'pending' })

    const {
      listing,
      from,
      value,
      quantity,
      startDate,
      endDate,
      currency
    } = this.props

    const variables = {
      listingID: listing.id,
      value,
      currency: currency || 'token-ETH',
      from,
      quantity: Number(quantity)
    }

    if (listing.__typename === 'FractionalListing') {
      variables.fractionalData = { startDate, endDate }
    }
    makeOffer({ variables })
  }

  canTransact() {
    if (this.props.disabled) {
      return false
    }
    if (this.props.cannotTransact === 'no-wallet') {
      const { pathname, search } = this.props.location
      sessionStore.set('getStartedRedirect', { pathname, search })
      this.setState({ onboard: true })
      return false
    } else if (this.props.cannotTransact) {
      this.setState({
        error: this.props.cannotTransact,
        errorData: this.props.cannotTransactData
      })
      return false
    }

    return true
  }

  onSwapToToken(swapToToken) {
    if (!this.canTransact()) {
      return
    }

    this.setState({ waitForSwap: 'pending' })

    const variables = {
      from: this.props.from,
      token: this.props.currency,
      tokenValue: String(this.props.tokenStatus.needsBalance)
    }

    swapToToken({ variables })
  }

  renderWaitModal() {
    if (!this.state.waitFor) return null
    return (
      <WaitForTransaction
        hash={this.state.waitFor}
        event="OfferCreated"
        onClose={() => this.setState({ waitFor: null })}
      >
        {({ event }) => (
          <div className="make-offer-modal success">
            <div className="success-icon" />
            <h5>Success!</h5>
            <div className="disclaimer">
              You have made an offer on this listing. Your offer will be visible
              within a few seconds. Your ETH payment has been transferred to an
              escrow contract. Here&apos;s what happens next:
              <ul>
                <li>The seller can choose to accept or reject your offer.</li>
                <li>
                  If the offer is accepted and fulfilled, you will be able to
                  confirm that the sale is complete. Your escrowed payment will
                  be sent to the seller.
                </li>
                <li>
                  If the offer is rejected, the escrowed payment will be
                  immediately returned to your wallet.
                </li>
              </ul>
            </div>
            <button
              href="#"
              className="btn btn-outline-light"
              onClick={() => {
                this.setState({ loading: true })
                const netId = get(this.props, 'web3.networkId')
                const { listingID, offerID } = event.returnValues
                const offerId = `${netId}-000-${listingID}-${offerID}`
                const redirect = `/purchases/${offerId}`

                if (this.props.refetch) {
                  this.props.refetch(redirect)
                }
              }}
              children={this.state.loading ? 'Loading...' : 'View Purchase'}
            />
          </div>
        )}
      </WaitForTransaction>
    )
  }

  renderWaitSwapModal() {
    if (!this.state.waitForSwap) return null
    return (
      <WaitForTransaction
        hash={this.state.waitForSwap}
        onClose={() => this.setState({ waitForSwap: null })}
      >
        {({ event }) => (
          <div className="make-offer-modal success">
            <div className="success-icon" />
            <h5>Success!</h5>
            <button
              href="#"
              className="btn btn-outline-light"
              onClick={() => {}}
              children={this.state.loading ? 'Loading...' : 'Next'}
            />
          </div>
        )}
      </WaitForTransaction>
    )
  }
}

export default withWeb3(withWallet(withCanTransact(withRouter(Buy))))

require('react-styl')(`
  .make-offer-modal
    display: flex
    flex-direction: column
    align-items: center
    .success-icon
      background: url(images/circular-check-button.svg) no-repeat center
      background-size: contain
      height: 3.5rem
      width: 3.5rem
      margin-bottom: 2rem
    .error-icon
      width: 100%
    .spinner,.error-icon
      margin-bottom: 2rem
    .btn
      margin-top: 2rem
    .disclaimer
      font-size: 14px
      margin-top: 1rem
    &.success
      ul
        text-align: left
        margin-bottom: 0
        margin-top: 1rem
        li
          margin-bottom: 0.5rem
    .metamask-video
      margin-bottom: 1rem

  @media (max-width: 767.98px)
    .make-offer-modal
      .btn
        margin-top: 1rem
      .spinner,.error-icon
        margin-bottom: 1rem

`)
