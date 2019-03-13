import React, { Component } from 'react'
import { Mutation } from 'react-apollo'
import get from 'lodash/get'

import MakeOfferMutation from 'mutations/MakeOffer'

import TransactionError from 'components/TransactionError'
import WaitForTransaction from 'components/WaitForTransaction'
import withCanTransact from 'hoc/withCanTransact'
import withWallet from 'hoc/withWallet'
import withWeb3 from 'hoc/withWeb3'

class Buy extends Component {
  state = {}
  render() {
    return (
      <>
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
              {this.state.error && (
                <TransactionError
                  reason={this.state.error}
                  data={this.state.errorData}
                  onClose={() => this.setState({ error: false })}
                />
              )}
            </>
          )}
        </Mutation>
      </>
    )
  }

  onClick(makeOffer) {
    if (this.props.disabled) {
      return
    }
    if (this.props.cannotTransact) {
      this.setState({
        error: this.props.cannotTransact,
        errorData: this.props.cannotTransactData
      })
      return
    }

    this.setState({ waitFor: 'pending' })

    const { listing, from, value, quantity, startDate, endDate } = this.props
    const variables = {
      listingID: listing.id,
      value,
      from,
      quantity: Number(quantity)
    }
    if (listing.__typename === 'FractionalListing' || listing.__typename === 'FractionalHourlyListing') {
      variables.fractionalData = { startDate, endDate }
    }
    makeOffer({ variables })
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
}

export default withWeb3(withWallet(withCanTransact(Buy)))

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
