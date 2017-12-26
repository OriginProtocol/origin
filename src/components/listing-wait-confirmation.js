import React, { Component } from 'react'

class ListingWaitConfirmation extends Component {

  componentWillMount() {
    this.txCheckTimer = setInterval(txCheckTimerCallback, 1000);
    let that = this
    function txCheckTimerCallback() {
      window.web3.eth.getTransaction(that.props.transactionReceipt, (error, transaction) => {
        console.log(transaction)
        if (transaction.blockNumber != null) {
          // TODO (Stan): Metamask web3 doesn't have this method. Probably could fix by
          // by doing the "copy local web3 over metamask's" technique.
          // window.web3.eth.getTransactionReceipt(this.props.transactionReceipt, (error, transactionReceipt) => {
          //   console.log(transactionReceipt)
          // })
          clearInterval(that.txCheckTimer)
          that.props.onListingConfirmed()
        }
      })
    }
  }

  render() {
    return (
    <div className="container">
      <h1>Waiting for confirmation</h1>
      <p>Transaction id: <pre>{this.props.transactionReceipt}</pre></p>
    </div>
    )
  }
}

export default ListingWaitConfirmation
