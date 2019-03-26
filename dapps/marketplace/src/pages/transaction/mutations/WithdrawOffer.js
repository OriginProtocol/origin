import React, { Component } from 'react'
import { Mutation } from 'react-apollo'
import { fbt } from 'fbt-runtime'

import WithdrawOfferMutation from 'mutations/WithdrawOffer'

import Modal from 'components/Modal'
import TransactionError from 'components/TransactionError'
import WaitForTransaction from 'components/WaitForTransaction'
import withCanTransact from 'hoc/withCanTransact'

class WithdrawOffer extends Component {
  state = {}
  render() {
    return (
      <Mutation
        mutation={WithdrawOfferMutation}
        onCompleted={({ withdrawOffer }) =>
          this.setState({ waitFor: withdrawOffer.id })
        }
        onError={errorData =>
          this.setState({
            waitFor: false,
            error: 'mutation',
            errorData
          })
        }
      >
        {(withdrawOffer, { client }) => (
          <>
            <button
              className="btn btn-link withdraw"
              onClick={() => this.setState({ sure: true })}
              children="Withdraw Offer"
            />
            {!this.state.sure ? null : (
              <Modal
                onClose={() =>
                  this.setState({ sure: false, sureShouldClose: false })
                }
                shouldClose={this.state.sureShouldClose}
              >
                <h2>
                  <fbt desc="WithdrawOffer.withdraw">Withdraw Offer</fbt>
                </h2>
                <fbt desc="WithdrawOffer.areYouSure">
                  Are you sure you want to withdraw your offer? Your escrowed
                  payment wil be returned to your wallet.
                </fbt>
                <div className="actions">
                  <button
                    className="btn btn-outline-light"
                    onClick={() => this.setState({ sureShouldClose: true })}
                    children="Cancel"
                  />
                  <button
                    className="btn btn-outline-light"
                    onClick={() => this.onClick(withdrawOffer)}
                    children="Withdraw"
                  />
                </div>
              </Modal>
            )}
            {this.renderWaitModal(client)}
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

  onClick(withdrawOffer) {
    this.setState({ sureShouldClose: true })

    if (this.props.cannotTransact) {
      this.setState({
        error: this.props.cannotTransact,
        errorData: this.props.cannotTransactData
      })
      return
    }

    this.setState({ waitFor: 'pending' })
    withdrawOffer({
      variables: {
        offerID: this.props.offer.id,
        from: this.props.offer.buyer.id
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
        event="OfferWithdrawn"
      >
        {() => (
          <div className="make-offer-modal">
            <div className="success-icon" />
            <div>
              <fbt desc="WithdrawOffers.success">Success!</fbt>
            </div>
            <button
              href="#"
              className="btn btn-outline-light"
              onClick={() => this.setState({ waitForShouldClose: true })}
              children="OK"
            />
          </div>
        )}
      </WaitForTransaction>
    )
  }
}

export default withCanTransact(WithdrawOffer)
