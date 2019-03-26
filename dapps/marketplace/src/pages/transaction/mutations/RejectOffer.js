import React, { Component } from 'react'
import { Mutation } from 'react-apollo'
import Redirect from 'components/Redirect'
import { fbt } from 'fbt-runtime'

import WithdrawOfferMutation from 'mutations/WithdrawOffer'

import Modal from 'components/Modal'
import TransactionError from 'components/TransactionError'
import WaitForTransaction from 'components/WaitForTransaction'
import withCanTransact from 'hoc/withCanTransact'

class RejectOffer extends Component {
  state = {}
  render() {
    if (this.state.redirect) {
      return <Redirect to={this.state.redirect} push />
    }
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
                <h2>
                  <fbt desc="RejectOffer.reject">Reject Offer</fbt>
                </h2>
                <fbt desc="RejectOffer.areYouSure">
                  Are you sure you want to reject this offer? The buyers funds
                  will be returned to them.
                </fbt>
                <div className="actions">
                  <button
                    className="btn btn-outline-light"
                    onClick={() => this.setState({ sureShouldClose: true })}
                    children={fbt("Cancel", "Cancel")}
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

  renderWaitModal() {
    if (!this.state.waitFor) return null

    return (
      <WaitForTransaction
        hash={this.state.waitFor}
        event="OfferWithdrawn"
        shouldClose={this.state.waitForShouldClose}
        onClose={async () => {
          if (this.props.refetch) {
            await this.props.refetch()
          }
        }}
      >
        {() => (
          <div className="reject-offer-modal">
            <h2>
              <fbt desc="RejectOffer.thisOfferRejected">
                This offer has been rejected
              </fbt>
            </h2>
            <div>
              <fbt desc="RejectOffer.youveRejected">
                You&#39;ve rejected this buyer&#39;s offer.
              </fbt>
            </div>
            <div className="actions">
              <button
                className="btn btn-outline-light"
                onClick={() => this.setState({ waitForShouldClose: true })}
                children="OK"
              />
            </div>
          </div>
        )}
      </WaitForTransaction>
    )
  }
}

export default withCanTransact(RejectOffer)

require('react-styl')(`
  .reject-offer-modal
    h2
      padding-top: 7rem
      position: relative
      &::before,&::after
        content: ""
        position: absolute;
        width: 5.75rem
        height: 5.75rem
        top: 0
        left: calc(50% - 2.5rem)
      &::before
        border-radius: 5rem
        background: var(--white)
      &::after
        background: url(images/reject-icon.svg) no-repeat center 60%
`)
