import React, { Component } from 'react'

import EtherscanLink from 'components/etherscan-link'
import origin from '../../services/origin'

class TransactionEvent extends Component {
  render() {
    const { eventName, event } = this.props

    if (!event) {
      return null
    }

    return (
      <tr>
        <td>
          <span className="progress-circle checked" />
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
