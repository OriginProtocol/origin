import React, { Component } from 'react'
import { Mutation } from 'react-apollo'
import get from 'lodash/get'
import { fbt } from 'fbt-runtime'

import UpdateListingMutation from 'mutations/UpdateListing'
import AllowTokenMutation from 'mutations/AllowToken'

import TransactionError from 'components/TransactionError'
import WaitForTransaction from 'components/WaitForTransaction'
import Redirect from 'components/Redirect'
import Modal from 'components/Modal'

import withCanTransact from 'hoc/withCanTransact'
import withWallet from 'hoc/withWallet'
import withWeb3 from 'hoc/withWeb3'
import withConfig from 'hoc/withConfig'

import applyListingData from './_listingData'

import Store from 'utils/store'
const store = Store('sessionStorage')

class UpdateListing extends Component {
  state = {}
  render() {
    if (this.state.redirect) {
      return <Redirect to={this.state.redirect} push />
    }
    let content

    let action = (
      <button
        className={this.props.className}
        onClick={() => this.setState({ modal: true })}
        children={this.props.children}
      />
    )

    const needsAllowance = get(this.props, 'tokenStatus.needsAllowance', false)
    const walletIsNotSeller = this.props.wallet !== this.props.listing.seller.id

    if (get(this.props, 'tokenStatus.loading')) {
      return <button className={this.props.className}>Loading...</button>
    }

    if (this.state.error) {
      content = (
        <TransactionError
          reason={this.state.error}
          data={this.state.errorData}
          onClose={() => this.setState({ error: false })}
        />
      )
    } else if (this.state.waitFor) {
      content = this.renderWaitModal()
    } else if (this.state.waitForAllow) {
      action = (
        <button
          className={this.props.className}
          onClick={() => this.setState({ modal: true })}
          children={'Wait...'}
        />
      )
      content = this.renderWaitAllowModal()
    } else if (walletIsNotSeller && needsAllowance) {
      action = this.renderAllowTokenMutation()
    } else {
      action = this.renderUpdateListingMutation()
      content = this.renderWaitModal()
    }

    return (
      <>
        {action}
        {!this.state.modal ? null : (
          <Modal
            onClose={() =>
              this.setState({ error: false, modal: false, shouldClose: false })
            }
            shouldClose={this.state.shouldClose}
          >
            {content}
          </Modal>
        )}
      </>
    )
  }

  renderUpdateListingMutation() {
    return (
      <Mutation
        mutation={UpdateListingMutation}
        onCompleted={({ updateListing }) => {
          this.setState({ waitFor: updateListing.id })
        }}
        onError={errorData =>
          this.setState({ waitFor: false, error: 'mutation', errorData })
        }
      >
        {updateListing => (
          <>
            <button
              className={this.props.className}
              onClick={() => this.onClick(updateListing)}
              children={this.props.children}
            />
          </>
        )}
      </Mutation>
    )
  }

  additionalDeposit() {
    const { listing, tokenBalance, listingTokens } = this.props
    if (!tokenBalance) return '0'

    const commission = Number(listing.commission)
    const existingCommission = Number(listingTokens)
    let additionalDeposit =
      tokenBalance >= commission ? commission : tokenBalance

    if (existingCommission > 0) {
      additionalDeposit = Math.max(0, additionalDeposit - existingCommission)
    }

    return String(additionalDeposit)
  }

  onClick(updateListing) {
    if (this.props.cannotTransact) {
      this.setState({
        error: this.props.cannotTransact,
        errorData: this.props.cannotTransactData
      })
      return
    }

    this.setState({ modal: true, waitFor: 'pending' })

    const { listing } = this.props

    updateListing({
      variables: applyListingData(this.props, {
        listingID: listing.id,
        additionalDeposit: this.additionalDeposit(),
        from: listing.seller.id
      })
    })
  }

  renderWaitModal() {
    const netId = get(this.props, 'web3.networkId')

    return (
      <WaitForTransaction
        hash={this.state.waitFor}
        event="ListingUpdated"
        contentOnly={true}
        onClose={() => this.setState({ waitFor: null })}
      >
        {({ event }) => (
          <div className="make-offer-modal success">
            <div className="success-icon" />
            <fbt desc="updateListing.success">
              <div>Your listing has been updated!</div>
              <div>
                Your listing will be visible within a few seconds. Here&apos;s
                what happens next:
                <ul>
                  <li>Buyers will now see your listing on the marketplace.</li>
                  <li>
                    When a buyer makes an offer on your listing, you can choose
                    to accept or reject it.
                  </li>
                  <li>
                    Once the offer is accepted, you will be expected to fulfill
                    the order.
                  </li>
                  <li>
                    You will receive payment once the buyer confirms that the
                    order has been fulfilled.
                  </li>
                </ul>
              </div>
            </fbt>
            <button
              href="#"
              className="btn btn-outline-light"
              onClick={async () => {
                this.setState({ loading: true })
                if (this.props.refetch) {
                  await this.props.refetch()
                }
                const { listingID } = event.returnValues
                store.set('create-listing', undefined)
                this.setState({
                  redirect: `/listing/${netId}-000-${listingID}`
                })
              }}
              children={
                this.state.loading
                  ? fbt('Loading', 'Loading')
                  : fbt('View Listing', 'View Listing')
              }
            />
          </div>
        )}
      </WaitForTransaction>
    )
  }

  renderAllowTokenModal() {
    return (
      <>
        <fbt desc="updateListing.approveOGN">
          <h2>Approve OGN</h2>
          Click below to approve OGN for use on Origin
        </fbt>
        <div className="actions">
          <button
            className="btn btn-outline-light"
            onClick={() => this.setState({ shouldClose: true })}
            children={fbt('Cancel', 'Cancel')}
          />
          {this.renderAllowTokenMutation()}
        </div>
      </>
    )
  }

  renderAllowTokenMutation() {
    return (
      <Mutation
        mutation={AllowTokenMutation}
        contentOnly={true}
        onCompleted={({ updateTokenAllowance }) => {
          this.setState({ waitForAllow: updateTokenAllowance.id })
        }}
        onError={errorData =>
          this.setState({ waitForAllow: false, error: 'mutation', errorData })
        }
      >
        {allowToken => (
          <button
            className={this.props.className}
            onClick={() => this.onAllowToken(allowToken)}
            children={this.props.children}
          />
        )}
      </Mutation>
    )
  }

  onAllowToken(allowToken) {
    if (!this.canTransact()) {
      return
    }

    this.setState({ modal: true, waitForAllow: 'pending' })

    const variables = {
      token: 'token-OGN',
      from: this.props.walletProxy,
      to: 'marketplace',
      value: this.additionalDeposit(),
      forceProxy: this.props.config.proxyAccountsEnabled
    }

    allowToken({ variables })
  }

  renderWaitAllowModal() {
    return (
      <WaitForTransaction hash={this.state.waitForAllow} contentOnly={true}>
        {() => (
          <div className="make-offer-modal success">
            <div className="success-icon-lg" />
            <h5>
              <fbt desc="success">Success!</fbt>
            </h5>
            <div className="help">
              <fbt desc="buy.sucessMoveDai">
                Origin may now move DAI on your behalf.
              </fbt>
            </div>
            {this.renderUpdateListingMutation()}
          </div>
        )}
      </WaitForTransaction>
    )
  }

  canTransact() {
    if (this.props.disabled) {
      return false
    }
    if (this.props.cannotTransact === 'no-wallet') {
      return false
    } else if (this.props.cannotTransact) {
      this.setState({
        modal: true,
        error: this.props.cannotTransact,
        errorData: this.props.cannotTransactData
      })
      return false
    }

    return true
  }
}

export default withConfig(withWeb3(withWallet(withCanTransact(UpdateListing))))
