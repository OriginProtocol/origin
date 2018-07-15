import React, { Component, Fragment } from 'react'
import { defineMessages, injectIntl } from 'react-intl'

// support uncategorized transactions
const NON_PURCHASE_RELATED_MESSAGE = 'A transaction is awaiting confirmation'

class TransactionMessage extends Component {
  constructor(props){
    super(props)

    this.intlMessages = defineMessages({
      purchased: {
        id: 'transaction.purchased',
        defaultMessage: 'You made a purchase.',
      },
    });
  }

  render() {
    const { className, listing, type } = this.props
    let message

    switch(type) {
      case 'purchased':
        message = this.props.intl.formatMessage(this.intlMessages.purchased)
        break
      default:
        return <p className={className || ''}>{NON_PURCHASE_RELATED_MESSAGE}</p>
    }

    return (
      <div className={`message${className ? ` ${className}` : ''}`}>{message}</div>
    )
  }
}

export default injectIntl(TransactionMessage)
