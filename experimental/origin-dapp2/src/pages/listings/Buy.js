import React, { Component } from 'react'
import { Mutation } from 'react-apollo'

import Modal from 'components/Modal'
import MakeOfferMutation from 'mutations/MakeOffer'

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

const ConfirmModal = () => (
  <div className="make-offer-modal">
    <div className="spinner light" />
    <div>
      <b>Confirm Transaction</b>
    </div>
    <div>Please accept or confirm this transaction in MetaMask</div>
  </div>
)

class Buy extends Component {
  state = {}
  render() {
    const { listing, from, value } = this.props
    const variables = { listingID: listing.id, value, from }

    return (
      <>
        <Mutation
          mutation={MakeOfferMutation}
          onCompleted={() => {
            this.setState({ success: true, shouldClose: true })
          }}
          onError={error => {
            console.log(error)
            this.setState({ modal: 'error' })
          }}
        >
          {makeOffer => {
            return (
              <button
                className="btn btn-primary"
                onClick={() => {
                  this.setState({ modal: true })
                  makeOffer({ variables })
                }}
                children="Buy Now"
              />
            )
          }}
        </Mutation>
        {this.state.modal && (
          <Modal
            shouldClose={this.state.shouldClose}
            submitted={this.state.success}
            onClose={() => this.setState({ modal: false, shouldClose: false })}
            children={
              this.state.modal === 'error' ? (
                <ErrorModal
                  onClose={() => this.setState({ shouldClose: true })}
                />
              ) : (
                <ConfirmModal />
              )
            }
          />
        )}
      </>
    )
  }
}

export default Buy

require('react-styl')(`
  .make-offer-modal
    .spinner,.error-icon
      margin-bottom: 2rem
    .btn
      margin-top: 2rem
`)
