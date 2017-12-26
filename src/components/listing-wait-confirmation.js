import React, { Component } from 'react'

class ListingWaitConfirmation extends Component {

  constructor(props) {
    super(props)
  }

  componentWillMount() {
  }

  render() {
    return (
    <div className="container">
      Awaiting confirmation for transaction id: {this.props.transactionReceipt}
    </div>
    )
  }
}

export default ListingWaitConfirmation
