import React, { Component } from 'react'
import { defineMessages, injectIntl } from 'react-intl'

// support other derived notifications in the future
const NON_PURCHASE_RELATED_MESSAGE = 'A message from Origin that does not involve a listing'

const intlMessages = defineMessages({
  shippingPending: {
    id: 'notification.purchaseCreated',
    defaultMessage: 'You have a new purchase.',
  },
  buyerPending: {
    id: 'notification.purchaseSent',
    defaultMessage: 'Your purchase has been shipped.',
  },
  sellerPending: {
    id: 'notification.purchaseReceived',
    defaultMessage: 'You have a new review.',
  },
  complete: {
    id: 'notification.purchaseComplete',
    defaultMessage: 'You have a new review.',
  },
})

class NotificationMessage extends Component {

  render() {
    const { className, type, intl } = this.props
    let message

    switch(type) {
      case 'buyer_review_received':
        message = intl.formatMessage(intlMessages.complete)
        break
      case 'seller_review_received':
        message = intl.formatMessage(intlMessages.sellerPending)
        break
      case 'buyer_listing_shipped':
        message = intl.formatMessage(intlMessages.buyerPending)
        break
      case 'seller_listing_purchased':
        message = intl.formatMessage(intlMessages.shippingPending)
        break
      default:
        return <p className={className || ''}>{NON_PURCHASE_RELATED_MESSAGE}</p>
    }

    return (
      <div className={`message${className ? ` ${className}` : ''}`}>{message}</div>
    )
  }
}

export default injectIntl(NotificationMessage)
