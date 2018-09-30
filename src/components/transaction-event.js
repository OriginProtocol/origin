import React, { Component } from 'react'

import EtherscanLink from 'components/etherscan-link'

class TransactionEvent extends Component {
  render() {
    const { danger, eventName, event } = this.props

    if (!event) {
      return null
    }

    return (
      <tr>
        <td>
          {!danger && <span className="progress-circle checked" />}
          {danger && <span className="progress-circle exclaimed">!</span>}
          {eventName}
        </td>
        <td className="text-truncate">
          {event && <EtherscanLink hash={event.transactionHash} />}
        </td>
      </tr>
    )
  }
}

export default TransactionEvent
