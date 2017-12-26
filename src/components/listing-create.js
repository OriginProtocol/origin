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
    console.log("onListingConfirmed")
    // TODO: Total hack. Figure out how to do with ReactRouter.
    // See: https://stackoverflow.com/a/42121109/59913
    window.document.location = "/"
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
            transactionReceipt="0xee36b0abc59c7a6084b6ad35b4cfd8dbe0ec1e4540b7d56ecbf14e91033f827d"
          />
        }
      </div>
    )
  }
}

export default ListingCreate
