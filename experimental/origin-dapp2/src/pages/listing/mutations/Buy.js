import React, { Component } from 'react'
import { Mutation, Query } from 'react-apollo'
import get from 'lodash/get'

import Link from 'components/Link'
import Redirect from 'components/Redirect'
import Modal from 'components/Modal'
import MakeOfferMutation from 'mutations/MakeOffer'
import CanBuyQuery from 'queries/CanBuy'
import TransactionReceiptQuery from 'queries/TransactionReceipt'

const ErrorModal = ({ onClose }) => (
  <div className="make-offer-modal">
    <div className="error-icon" />
    <div>There was a problem purchasing this listing.</div>
    <div>See the console for more details.</div>
    <button
      href="#"
      className="btn btn-outline-light"
      onClick={() => onClose()}
      children="OK"
    />
  </div>
)

const WrongNetwork = ({ onClose, networkName }) => (
  <div className="make-offer-modal">
    <div className="error-icon" />
    <div>{`Please switch MetaMask to ${networkName}`}</div>
    <button
      href="#"
      className="btn btn-outline-light"
      onClick={() => onClose()}
      children="OK"
    />
  </div>
)

const NoBalance = ({ onClose }) => (
  <div className="make-offer-modal">
    <div className="error-icon" />
    <div>Insufficient Funds</div>
    <button
      href="#"
      className="btn btn-outline-light"
      onClick={() => onClose()}
      children="OK"
    />
  </div>
)

const MetaMaskError = ({ onClose }) => (
  <div className="make-offer-modal">
    <div className="error-icon" />
    <div>MetaMask Error</div>
    <div>Wrong network?</div>
    <button
      href="#"
      className="btn btn-outline-light"
      onClick={() => onClose()}
      children="OK"
    />
  </div>
)

const CompleteModal = ({ offerId }) => (
  <div className="make-offer-modal">
    <div className="success-icon" />
    <div>Success!</div>
    <div className="disclaimer">
      You have made an offer on this listing. Your offer will be visible within
      a few seconds. Your ETH payment has been transferred to an escrow
      contract. Here&apos;s what happens next:
      <ul>
        <li>The seller can choose to accept or reject your offer.</li>
        <li>
          If the offer is accepted and fulfilled, you will be able to confirm
          that the sale is complete. Your escrowed payment will be sent to the
          seller.
        </li>
        <li>
          If the offer is rejected, the escrowed payment will be immediately
          returned to your wallet.
        </li>
      </ul>
    </div>
    <Link to={`/purchases/${offerId}`} className="btn btn-outline-light">
      View Purchase
    </Link>
  </div>
)

const ConfirmModal = () => (
  <div className="make-offer-modal">
    <div className="spinner light" />
    <div>
      <b>Confirm Transaction</b>
    </div>
    <div>Please accept or confirm this transaction in MetaMask</div>
  </div>
)

class WaitFor extends Component {
  render() {
    return (
      <Query
        query={TransactionReceiptQuery}
        variables={{ id: this.props.transaction }}
        pollInterval={3000}
      >
        {({ data }) => {
          const event = get(data, 'web3.transactionReceipt.events', []).find(
            e => e.event === 'OfferCreated'
          )
          if (!event) {
            return (
              <div className="make-offer-modal">
                <div className="spinner light" />
                <div>
                  <b>Mining...</b>
                </div>
              </div>
            )
          }
          return (
            <CompleteModal
              offerId={`999-1-${event.returnValues.listingID}-${
                event.returnValues.offerID
              }`}
            />
          )
        }}
      </Query>
    )
  }
}

class Buy extends Component {
  state = {}
  render() {
    if (this.state.redirect) {
      return <Redirect to={this.state.redirect} />
    }

    const modalProps = {
      shouldClose: this.state.shouldClose,
      submitted: this.state.success,
      onClose: () => this.closeModal()
    }
    return (
      <>
        <Query query={CanBuyQuery}>
          {canBuy => {
            return (
              <Mutation
                mutation={MakeOfferMutation}
                onCompleted={({ makeOffer }) => {
                  this.setState({ waitFor: makeOffer.id })
                  // this.shouldClose({ success: true })
                  // console.log('Completed', makeOffer.id)
                }}
                onError={error => {
                  console.log(error)
                  this.setState({ modal: 'error' })
                }}
              >
                {makeOffer => (
                  <>
                    <button
                      className="btn btn-primary"
                      onClick={() => this.onClick(makeOffer, canBuy)}
                      children={
                        canBuy.loading && this.state.loading
                          ? 'Loading'
                          : 'Buy Now'
                      }
                    />
                    {canBuy.error && this.state.showError && (
                      <Modal {...modalProps}>
                        <MetaMaskError onClose={() => this.shouldClose()} />
                      </Modal>
                    )}
                  </>
                )}
              </Mutation>
            )
          }}
        </Query>
        {this.state.modal && (
          <Modal {...modalProps}>
            {this.state.modal === 'error' ? (
              <ErrorModal onClose={() => this.shouldClose()} />
            ) : this.state.waitFor ? (
              <WaitFor transaction={this.state.waitFor} />
            ) : (
              <ConfirmModal />
            )}
          </Modal>
        )}
        {this.state.wrongNetwork && (
          <Modal {...modalProps}>
            <WrongNetwork
              onClose={() => this.shouldClose()}
              networkName={this.state.wrongNetwork.web3.networkName}
            />
          </Modal>
        )}
        {this.state.noBalance && (
          <Modal {...modalProps}>
            <NoBalance onClose={() => this.shouldClose()} />
          </Modal>
        )}
      </>
    )
  }

  shouldClose({ success = false } = {}) {
    this.setState({ shouldClose: true, success })
  }

  closeModal() {
    this.setState({
      modal: false,
      wrongNetwork: false,
      noBalance: false,
      shouldClose: false,
      showError: false
    })
  }

  onClick(makeOffer, { data, loading, error }) {
    if (loading) {
      this.setState({ loading: true, showError: true })
      return
    }
    if (error) {
      this.setState({ showError: true })
      return
    }
    if (!data || !data.web3) return

    const { listing, from, value } = this.props
    const variables = { listingID: listing.id, value, from }

    const eth = Number(get(data, 'web3.metaMaskAccount.balance.eth', 0))
    if (!data.web3.metaMaskAccount) {
      this.setState({ redirect: `/listings/${this.props.listing.id}/onboard` })
    } else if (data.web3.networkId !== data.web3.metaMaskNetworkId) {
      this.setState({ wrongNetwork: data })
    } else if (eth < value) {
      this.setState({ noBalance: true })
    } else {
      this.setState({ modal: true })
      makeOffer({ variables })
    }
  }
}

export default Buy

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
`)
