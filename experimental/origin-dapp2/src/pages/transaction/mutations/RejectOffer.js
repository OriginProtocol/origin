import React, { Component } from 'react'
import { Mutation } from 'react-apollo'
import Link from 'components/Link'

import WithdrawOfferMutation from 'mutations/WithdrawOffer'

import Modal from 'components/Modal'
import TransactionError from 'components/TransactionError'
import WaitForTransaction from 'components/WaitForTransaction'
import withCanTransact from 'hoc/withCanTransact'

class RejectOffer extends Component {
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
              className={this.props.className}
              onClick={() => this.setState({ sure: true })}
              children={this.props.children}
            />
            {!this.state.sure ? null : (
              <Modal
                onClose={() =>
                  this.setState({ sure: false, sureShouldClose: false })
                }
                shouldClose={this.state.sureShouldClose}
              >
                <h2>Reject Offer</h2>
                Are you sure you want to reject this offer? The buyers funds
                will be returned to them.
                <div className="actions">
                  <button
                    className="btn btn-outline-light"
                    onClick={() => this.setState({ sureShouldClose: true })}
                    children="Cancel"
                  />
                  <button
                    className="btn btn-outline-light"
                    onClick={() => this.onClick(withdrawOffer)}
                    children="Reject"
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
        from: this.props.offer.listing.seller.id
      }
    })
  }

  renderWaitModal(client) {
    if (!this.state.waitFor) return null

    return (
      <WaitForTransaction
        hash={this.state.waitFor}
        event="OfferWithdrawn"
        shouldClose={this.state.waitForShouldClose}
        onClose={async () => await client.resetStore()}
      >
        {() => (
          <div className='reject-offer-modal'>
            <div className="d-flex image-container mx-auto justify-content-center">
              <img src="images/reject-icon.svg" className="align-self-center"/>
            </div>
            <h2>This offer has been rejected</h2>
            <span className="mx-auto">
              You've rejected this buyer's offer,
              click below to go back to your listings.
            </span>
            <Link
              to="/" className="btn btn-outline-light"
              onClick={() => this.setState({ waitForShouldClose: true })}
            >
              Back to your listings
            </Link>
          </div>
        )}
      </WaitForTransaction>
    )
  }
}

export default withCanTransact(RejectOffer)

require('react-styl')(`
  .pl-modal
    .pl-modal-table
      .pl-modal-cell
        padding: 1rem
        .pl-modal-content
          max-width: 440px
  .reject-offer-modal
    .image-container
      border-radius: 45px
      width: 92px
      height: 92px
      background-color: var(--white)
      img
        width: 54px
        height: 54px
    span
      width: 295px
    h2
      font-size: 1.375rem
      margin-top: 0.9375rem
    a
      margin: 20px
`)
