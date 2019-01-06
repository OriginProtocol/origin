import React, { Component } from 'react'
import { Mutation } from 'react-apollo'

import UpdateListingMutation from 'mutations/UpdateListing'

import TransactionError from 'components/TransactionError'
import WaitForTransaction from 'components/WaitForTransaction'
import Link from 'components/Link'
import withCanTransact from 'hoc/withCanTransact'
import withWallet from 'hoc/withWallet'

class UpdateListing extends Component {
  state = {}
  render() {
    return (
      <Mutation
        mutation={UpdateListingMutation}
        onCompleted={({ updateListing }) => {
          this.setState({ waitFor: updateListing.id })
        }}
        onError={errorData =>
          this.setState({ waitFor: false, error: 'mutation', errorData })
        }
      >
        {updateListing => (
          <>
            <button
              className={this.props.className}
              onClick={() => this.onClick(updateListing)}
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

  onClick(updateListing) {
    const { listing } = this.props
    if (this.props.cannotTransact) {
      this.setState({
        error: this.props.cannotTransact,
        errorData: this.props.cannotTransactData
      })
      return
    }

    this.setState({ waitFor: 'pending' })
    updateListing({
      variables: {
        listingID: this.props.listingId,
        additionalDeposit: listing.boost,
        from: this.props.wallet,
        data: {
          title: listing.title,
          description: listing.description,
          price: { currency: 'ETH', amount: listing.price },
          category: listing.category,
          subCategory: listing.subCategory,
          media: listing.media || [],
          unitsTotal: Number(listing.quantity),
          isMultiUnit: Number(listing.quantity) > 1
        },
        autoApprove: true
      }
    })
  }

  renderWaitModal() {
    if (!this.state.waitFor) return null

    return (
      <WaitForTransaction hash={this.state.waitFor} event="ListingUpdated">
        {({ event }) => (
          <div className="make-offer-modal">
            <div className="success-icon" />
            <div>Success!</div>
            <Link
              to={`/listings/${event.returnValues.listingID}`}
              className="btn btn-outline-light"
              children="View Listing"
            />
          </div>
        )}
      </WaitForTransaction>
    )
  }
}

export default withWallet(withCanTransact(UpdateListing))
