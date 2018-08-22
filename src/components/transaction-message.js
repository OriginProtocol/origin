import React, { Component } from 'react'
import { defineMessages, injectIntl } from 'react-intl'

// support uncategorized transactions
const UNCATEGORIZED_MESSAGE = 'A transaction is awaiting confirmation'

class TransactionMessage extends Component {
  constructor(props) {
    super(props)

    this.intlMessages = defineMessages({
      buyListing: {
        id: 'transaction.buyListing',
        defaultMessage: 'You made a purchase.'
      },
      closeListing: {
        id: 'transaction.closeListing',
        defaultMessage: 'You closed a listing'
      },
      confirmReceipt: {
        id: 'transaction.confirmReceipt',
        defaultMessage: 'You left a review and confirmed receipt.'
      },
      confirmShipped: {
        id: 'transaction.confirmShipped',
        defaultMessage: 'You marked a purchase as shipped.'
      },
      createListing: {
        id: 'transaction.createListing',
        defaultMessage: 'You created a listing'
      },
      getPayout: {
        id: 'transaction.getPayout',
        defaultMessage: 'You left a review and withdrew funds.'
      }
    })
  }

  render() {
    const { className, type } = this.props
    const message = type
      ? this.props.intl.formatMessage(this.intlMessages[type])
      : UNCATEGORIZED_MESSAGE

    return (
      <div className={`message${className ? ` ${className}` : ''}`}>
        {message}
      </div>
    )
  }
}

export default injectIntl(TransactionMessage)
