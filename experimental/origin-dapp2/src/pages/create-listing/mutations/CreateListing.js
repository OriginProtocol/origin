import React, { Component } from 'react'
import { Mutation } from 'react-apollo'
import pick from 'lodash/pick'

import CreateListingMutation from 'mutations/CreateListing'

import TransactionError from 'components/TransactionError'
import WaitForTransaction from 'components/WaitForTransaction'
import Redirect from 'components/Redirect'
import withCanTransact from 'hoc/withCanTransact'
import withWallet from 'hoc/withWallet'

import Store from 'utils/store'
const store = Store('sessionStorage')

class CreateListing extends Component {
  state = {}
  render() {
    if (this.state.redirect) {
      return <Redirect to={this.state.redirect} push />
    }
    return (
      <Mutation
        mutation={CreateListingMutation}
        onCompleted={({ createListing }) => {
          this.setState({ waitFor: createListing.id })
        }}
        onError={errorData =>
          this.setState({ waitFor: false, error: 'mutation', errorData })
        }
      >
        {createListing => (
          <>
            <button
              className={this.props.className}
              onClick={() => this.onClick(createListing)}
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

  onClick(createListing) {
    const { listing } = this.props
    if (this.props.cannotTransact) {
      this.setState({
        error: this.props.cannotTransact,
        errorData: this.props.cannotTransactData
      })
      return
    }

    this.setState({ waitFor: 'pending' })

    const unitsTotal = Number(listing.quantity)

    createListing({
      variables: {
        deposit:
          this.props.tokenBalance >= Number(listing.boost)
            ? listing.boost
            : '0',
        depositManager: this.props.wallet,
        from: this.props.wallet,
        data: {
          title: listing.title,
          description: listing.description,
          price: { currency: 'ETH', amount: listing.price },
          category: listing.category,
          subCategory: listing.subCategory,
          media: listing.media.map(m => pick(m, 'contentType', 'url')),
          commission: unitsTotal > 1 ? listing.boostLimit : listing.boost,
          commissionPerUnit: listing.boost
        },
        unitData: {
          unitsTotal
        },
        autoApprove: true
      }
    })
  }

  renderWaitModal() {
    if (!this.state.waitFor) return null

    return (
      <WaitForTransaction hash={this.state.waitFor} event="ListingCreated">
        {({ event, client }) => (
          <div className="make-offer-modal">
            <div className="success-icon" />
            <div>Success!</div>
            <button
              href="#"
              className="btn btn-outline-light"
              onClick={async () => {
                await client.resetStore()
                store.set('create-listing', undefined)
                // TODO: Fix listing ID
                this.setState({
                  redirect: `/listings/999-1-${event.returnValues.listingID}`
                })
              }}
              children="View Listing"
            />
          </div>
        )}
      </WaitForTransaction>
    )
  }
}

export default withWallet(withCanTransact(CreateListing))
