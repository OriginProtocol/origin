import React, { Component } from 'react'
import EtherscanLink from '../../components/etherscan-link'
import moment from 'moment'

class TransactionEvent extends Component {

  render() {

    const { eventName, timestamp, transaction, buyer, seller } = this.props

    const eventTitle = `${eventName} on <br /><strong>${moment(timestamp).format('MMM D, YYYY')}</strong>`
  
    return <tr>
      <td><span className="progress-circle checked" data-toggle="tooltip" data-placement="top" data-html="true" title={eventTitle}></span>{eventName}</td>
      <td className="text-truncate">{transaction && <EtherscanLink hash={transaction.transactionHash} />}</td>
      <td className="text-truncate">{buyer.address && <EtherscanLink hash={buyer.address} />}</td>
      <td className="text-truncate">{seller.address && <EtherscanLink hash={seller.address} />}</td>
    </tr>
    
  }
}

export default TransactionEvent
