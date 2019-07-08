import React, { Component } from 'react'
import { Mutation } from 'react-apollo'
import { fbt } from 'fbt-runtime'

import AddDataMutation from 'mutations/AddData'

import TransactionError from 'components/TransactionError'
import WaitForTransaction from 'components/WaitForTransaction'

import withCanTransact from 'hoc/withCanTransact'
import withWallet from 'hoc/withWallet'

class AddData extends Component {
  state = {}
  render() {
    return (
      <Mutation
        mutation={AddDataMutation}
        onCompleted={({ addData }) => this.setState({ waitFor: addData.id })}
        onError={errorData =>
          this.setState({ waitFor: false, error: 'mutation', errorData })
        }
      >
        {addData => (
          <>
            <button
              className={this.props.className}
              onClick={() => this.onClick(addData)}
              children={this.props.children}
              disabled={this.props.disabled}
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

  onClick(addData) {
    if (this.props.cannotTransact) {
      this.setState({
        error: this.props.cannotTransact,
        errorData: this.props.cannotTransactData
      })
      return
    }

    const { offer, data, from } = this.props
    const variables = {
      offerID: offer.id,
      listingID: offer.listing.id,
      from,
      data
    }

    this.setState({ waitFor: 'pending' })

    addData({ variables })
  }

  renderWaitModal() {
    if (!this.state.waitFor) return null

    return (
      <WaitForTransaction
        hash={this.state.waitFor}
        event="OfferData"
        onClose={() => this.setState({ waitFor: null })}
      >
        {({ client }) => (
          <div className="make-offer-modal">
            <div className="success-icon" />
            <div>
              <fbt desc="success">Success!</fbt>
            </div>
            <button
              href="#"
              className="btn btn-outline-light"
              onClick={async () => {
                if (this.props.onSuccess) {
                  this.props.onSuccess()
                }

                await client.resetStore()
                this.setState({ waitFor: false })
              }}
              children={fbt('OK', 'OK')}
            />
          </div>
        )}
      </WaitForTransaction>
    )
  }
}

export default withWallet(withCanTransact(AddData))
