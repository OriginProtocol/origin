import React, { Component } from 'react'

import ListingForm from './listing-form'
import ListingWaitConfirmation from './listing-wait-confirmation'


class ListingCreate extends Component {

  constructor(props) {
    super(props)
    this.state = {
      isListingSubmitted: true,
      transactionReceipt: null
    }
    this.onListingSubmitted = this.onListingSubmitted.bind(this)
  }

  onListingSubmitted(transactionReceipt, formListing) {
    console.log("onListingSubmitted")
    this.setState({
      isListingSubmitted: true,
      transactionReceipt: transactionReceipt
    })
  }

  onListingConfirmed() {
    // TODO: What next? Return to showing most recent listings?
  }

  render() {
    return (
      <div>
        { !this.state.isListingSubmitted &&
          <ListingForm
            onListingSubmitted={this.onListingSubmitted}
          />
        }
        { this.state.isListingSubmitted &&
          <ListingWaitConfirmation
            onListingConfirmed={this.onListingConfirmed}
            transactionReceipt={this.state.transactionReceipt}
          />
        }
      </div>
    )
  }
}

export default ListingCreate
