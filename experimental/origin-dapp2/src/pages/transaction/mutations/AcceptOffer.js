import React, { Component } from 'react'
import { Mutation } from 'react-apollo'

import AcceptOfferMutation from 'mutations/AcceptOffer'

import TransactionError from 'components/TransactionError'
import WaitForTransaction from 'components/WaitForTransaction'
import withCanTransact from 'hoc/withCanTransact'

class AcceptOffer extends Component {
  state = {}
  render() {
    return (
      <Mutation
        mutation={AcceptOfferMutation}
        onCompleted={({ acceptOffer }) => {
          this.setState({ waitFor: acceptOffer.id })
        }}
        onError={errorData =>
          this.setState({ waitFor: false, error: 'mutation', errorData })
        }
      >
        {acceptOffer => (
          <>
            <button
              className={this.props.className}
              onClick={() => this.onClick(acceptOffer)}
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
    )
  }

  onClick(acceptOffer) {
    if (this.props.cannotTransact) {
      this.setState({
        error: this.props.cannotTransact,
        errorData: this.props.cannotTransactData
      })
      return
    }

    this.setState({ waitFor: 'pending' })
    acceptOffer({
      variables: {
        offerID: this.props.offer.id,
        from: this.props.offer.listing.seller.id
      }
    })
  }

  renderWaitModal() {
    if (!this.state.waitFor) return null

    return (
      <WaitForTransaction hash={this.state.waitFor} event="OfferAccepted">
        {({ client }) => (
          <div className="make-offer-modal">
            <div className="success-icon" />
            <div>Success!</div>
            <button
              href="#"
              className="btn btn-outline-light"
              onClick={() => {
                client.resetStore()
                this.setState({ waitFor: false })
              }}
              children="OK"
            />
          </div>
        )}
      </WaitForTransaction>
    )
  }
}

export default withCanTransact(AcceptOffer)
