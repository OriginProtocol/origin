import React, { Component } from 'react'

import ListingForm from './listing-form'
import ListingWaitConfirmation from './listing-wait-confirmation'


class ListingCreate extends Component {


  constructor(props) {
    super(props)
    // TODO: js enum thing for state
    this.STEP = {PICK_SCHEMA: 1, DETAILS: 2, PREVIEW: 3, SUBMITTED: 4}

    this.state = {
      // isListingSubmitted: false,
      transactionReceipt: null,
      step: this.STEP.DETAILS,
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
    window.setTimeout(() => {window.document.location = "/"}, 2000);
  }

  render() {
    return (
      <div>
        { this.state.step === this.STEP.PICK_SCHEMA &&
          <ListingForm
            onListingSubmitted={this.onListingSubmitted}
          />
        }
        { this.state.step === this.STEP.DETAILS &&
          <ListingForm
            onListingSubmitted={this.onListingSubmitted}
          />
        }
        { this.state.step === this.STEP.SUBMITTED &&
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
