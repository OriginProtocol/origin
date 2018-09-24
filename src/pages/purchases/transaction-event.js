import React, { Component } from 'react'

import EtherscanLink from 'components/etherscan-link'

class TransactionEvent extends Component {
  render() {
    const { eventName, transaction, buyer, seller } = this.props

    if (!transaction) {
      return null
    }

    return (
      <tr>
        <td>
          <span className="progress-circle checked" />
          {eventName}
        </td>
        <td className="text-truncate">
          {transaction && <EtherscanLink hash={transaction.transactionHash} />}
        </td>
        <td className="text-truncate">
          {buyer && buyer.address && <EtherscanLink hash={buyer.address} />}
        </td>
        <td className="text-truncate">
          {seller && seller.address && <EtherscanLink hash={seller.address} />}
        </td>
      </tr>
    )
  }
}

export default TransactionEvent
