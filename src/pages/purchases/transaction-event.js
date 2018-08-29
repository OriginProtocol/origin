import React, { Component } from 'react'
import moment from 'moment'

import EtherscanLink from 'components/etherscan-link'

class TransactionEvent extends Component {
  render() {
    const { eventName, transaction, buyer, seller } = this.props
    if (!transaction) return null

    const date = moment(transaction.timestamp * 1000).format('MMM D, YYYY')
    const eventTitle = `${eventName} on <br /><strong>${date}</strong>`

    return (
      <tr>
        <td>
          <span
            className="progress-circle checked"
            data-toggle="tooltip"
            data-placement="top"
            data-html="true"
            title={eventTitle}
          />
          {eventName}
        </td>
        <td className="text-truncate">
          {transaction && <EtherscanLink hash={transaction.transactionHash} />}
        </td>
        <td className="text-truncate">
          {buyer.address && <EtherscanLink hash={buyer.address} />}
        </td>
        <td className="text-truncate">
          {seller.address && <EtherscanLink hash={seller.address} />}
        </td>
      </tr>
    )
  }
}

export default TransactionEvent
