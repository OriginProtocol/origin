import React, { Component } from 'react'

import EtherscanLink from 'components/etherscan-link'
import origin from '../../services/origin'

class TransactionEvent extends Component {
  async componentDidMount() {
    const { event } = this.props

    if (!event) {
      return null
    }

    // If no from address is passed in, we load the origin address from
    // transaction the event was fired from
    if (this.props.from === undefined) {
      const txHash = event.transactionHash
      const transaction = await origin.contractService.getTransaction(txHash)
      this.setState({ transactionFrom: { address: transaction.from } })
    }
  }

  render() {
    const { eventName, event } = this.props
    const from = this.props.from || (this.state && this.state.transactionFrom)

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
        <td className="text-truncate">
          {from && from.address && <EtherscanLink hash={from.address} />}
        </td>
      </tr>
    )
  }
}

export default TransactionEvent
