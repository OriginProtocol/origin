import React, { Component } from 'react'
import { Mutation } from 'react-apollo'
import { fbt } from 'fbt-runtime'

import FinalizeOfferMutation from 'mutations/FinalizeOffer'

import TransactionError from 'components/TransactionError'
import WaitForTransaction from 'components/WaitForTransaction'
import withCanTransact from 'hoc/withCanTransact'

class FinalizeOffer extends Component {
  state = {}
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
        {(finalizeOffer, { client }) => (
          <>
            <button
              className={this.props.className}
              onClick={() => this.onClick(finalizeOffer)}
              children={this.props.children}
            />
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
              <fbt desc="FinalizeOffer.success">Success!</fbt>
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

export default withCanTransact(FinalizeOffer)
