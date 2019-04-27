import React, { Component } from 'react'
import { Mutation } from 'react-apollo'
import { fbt } from 'fbt-runtime'

import FinalizeOfferMutation from 'mutations/FinalizeOffer'

import Modal from 'components/Modal'
import TransactionError from 'components/TransactionError'
import WaitForTransaction from 'components/WaitForTransaction'
import withCanTransact from 'hoc/withCanTransact'

class FinalizeOffer extends Component {
  state = {
    confirmationModal: false
  }

  render() {
    return (
      <Mutation
        mutation={FinalizeOfferMutation}
        onCompleted={({ finalizeOffer }) => {
          this.setState({ waitFor: finalizeOffer.id })
        }}
        onError={errorData =>
          this.setState({ waitFor: false, error: 'mutation', errorData })
        }
      >
        {finalizeOffer => (
          <>
            <button
              className={this.props.className}
              onClick={() =>
                this.setState({
                  confirmationModal: true
                })
              }
              children={this.props.children}
            />
            {this.renderConfirmationModal(finalizeOffer)}
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
    )
  }

  onClick(finalizeOffer) {
    if (this.props.cannotTransact) {
      this.setState({
        error: this.props.cannotTransact,
        errorData: this.props.cannotTransactData
      })
      return
    }

    this.setState({ waitFor: 'pending' })

    const { offer, rating, review } = this.props
    finalizeOffer({
      variables: {
        offerID: offer.id,
        from: offer.buyer.id,
        rating,
        review
      }
    })
  }

  renderWaitModal() {
    if (!this.state.waitFor) return null

    return (
      <WaitForTransaction
        shouldClose={this.state.waitForShouldClose}
        onClose={async () => {
          if (this.props.refetch) {
            this.props.refetch()
          }
          window.scrollTo(0, 0)
        }}
        hash={this.state.waitFor}
        event="OfferFinalized"
      >
        {() => (
          <div className="make-offer-modal">
            <div className="success-icon" />
            <div>
              <fbt desc="success">Success!</fbt>
            </div>
            <button
              href="#"
              className="btn btn-outline-light"
              onClick={() => this.setState({ waitForShouldClose: true })}
              children={fbt('OK', 'OK')}
            />
          </div>
        )}
      </WaitForTransaction>
    )
  }

  renderConfirmationModal(finalizeOffer) {
    if (!this.state.confirmationModal) {
      return null
    }

    return (
      <Modal
        onClose={() => {
          this.setState({
            confirmationModal: false
          })
        }}
      >
        <div className="finalize-offer-modal">
          <h2>
            <fbt desc="finalizeOffer.wantToReleaseFunds">
              Are you sure you want to release the funds?
            </fbt>
          </h2>
          <div>
            <fbt desc="finalizeOffer.cancelOrReport">
              If you don&#39;t want to do this, cancel and either report a
              problem or contact the seller with your concerns.
            </fbt>
          </div>
          <div className="actions">
            <button
              className="btn btn-outline-light"
              onClick={() => this.setState({ confirmationModal: false })}
              children={<fbt desc="finalizeOffer.noWait">No, wait...</fbt>}
            />
            <button
              className={this.props.className}
              onClick={() => this.onClick(finalizeOffer)}
              children={<fbt desc="finalizeOffer.yesPlease">Yes, please</fbt>}
            />
          </div>
        </div>
      </Modal>
    )
  }
}

export default withCanTransact(FinalizeOffer)

// require('react-styl')(`
//   .finalize-offer-modal
// `)
