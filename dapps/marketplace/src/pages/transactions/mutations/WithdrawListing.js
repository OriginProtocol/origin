import React, { Component } from 'react'
import { Mutation } from 'react-apollo'

import WithdrawListingMutation from 'mutations/WithdrawListing'

import Modal from 'components/Modal'
import TransactionError from 'components/TransactionError'
import WaitForTransaction from 'components/WaitForTransaction'
import withCanTransact from 'hoc/withCanTransact'

class WithdrawListing extends Component {
  state = {}
  render() {
    return (
      <Mutation
        mutation={WithdrawListingMutation}
        onCompleted={({ withdrawListing }) =>
          this.setState({ waitFor: withdrawListing.id })
        }
        onError={errorData =>
          this.setState({
            waitFor: false,
            error: 'mutation',
            errorData
          })
        }
      >
        {(withdrawListing, { client }) => (
          <>
            <a
              href="#"
              className="text-danger"
              children="Close Listing"
              onClick={e => {
                e.preventDefault()
                this.setState({ sure: true })
              }}
            />
            {!this.state.sure ? null : (
              <Modal
                onClose={() =>
                  this.setState({ sure: false, sureShouldClose: false })
                }
                shouldClose={this.state.sureShouldClose}
              >
                <h2>Withdraw Listing</h2>
                Are you sure you want to withdraw your listing?
                <div className="actions">
                  <button
                    className="btn btn-outline-light"
                    onClick={() => this.setState({ sureShouldClose: true })}
                    children={fbt("Cancel", "Cancel")}
                  />
                  <button
                    className="btn btn-outline-light"
                    onClick={() => this.onClick(withdrawListing)}
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

  onClick(withdrawListing) {
    this.setState({ sureShouldClose: true })

    if (this.props.cannotTransact) {
      this.setState({
        error: this.props.cannotTransact,
        errorData: this.props.cannotTransactData
      })
      return
    }

    this.setState({ waitFor: 'pending' })
    withdrawListing({
      variables: {
        listingID: this.props.listing.id,
        from: this.props.listing.arbitrator.id,
        target: this.props.listing.seller.id
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
        event="ListingWithdrawn"
      >
        {() => (
          <div className="make-offer-modal">
            <div className="success-icon" />
            <div>Success!</div>
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

export default withCanTransact(WithdrawListing)
