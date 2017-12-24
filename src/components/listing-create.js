import React, { Component } from 'react'

import ListingForm from './listing-form'

const ListingWaitConfirmation = () => {
  return (
    <div>
      Awaiting confirmation...
    </div>
  )
}


class ListingCreate extends Component {

  constructor(props) {
    super(props)
    this.state = {isListingSubmitted: false}

    this.onListingSubmitted = this.onListingSubmitted.bind(this)
  }

  onListingSubmitted(transactionReceipt, formListing) {
    console.log("onListingSubmitted")
      this.setState({
        isListingSubmitted: true,
      })
  }

  onListingConfirmed() {
    // TODO: What next? Return to showing most recent listings?
  }

  render() {
    return (
      <div>
        { !this.state.isListingSubmitted &&
          <ListingForm onListingSubmitted={this.onListingSubmitted}/>
        }
        { this.state.isListingSubmitted &&
          <ListingWaitConfirmation onListingConfirmed={this.onListingConfirmed}/>
        }
      </div>
    );
  }
}

export default ListingCreate
