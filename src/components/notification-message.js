import React, { Component } from 'react'
import { defineMessages, injectIntl } from 'react-intl'

// support other derived notifications in the future
const NON_PURCHASE_RELATED_MESSAGE =
  'A message from Origin that does not involve a listing'

class NotificationMessage extends Component {
  constructor(props) {
    super(props)

    this.intlMessages = defineMessages({
      shippingPending: {
        id: 'notification.purchaseCreated',
        defaultMessage: 'You have a new sale.'
      },
      buyerPending: {
        id: 'notification.purchaseSent',
        defaultMessage: 'Your purchase has been shipped.'
      },
      sellerPending: {
        id: 'notification.purchaseReceived',
        defaultMessage: 'You have a new review.'
      },
      complete: {
        id: 'notification.purchaseComplete',
        defaultMessage: 'You have a new review.'
      }
    })
  }

  render() {
    const { className, type } = this.props
    let message

    switch (type) {
    case 'buyer_review_received':
      message = this.props.intl.formatMessage(this.intlMessages.complete)
      break
    case 'seller_review_received':
      message = this.props.intl.formatMessage(this.intlMessages.sellerPending)
      break
    case 'buyer_listing_shipped':
      message = this.props.intl.formatMessage(this.intlMessages.buyerPending)
      break
    case 'seller_listing_purchased':
      message = this.props.intl.formatMessage(
        this.intlMessages.shippingPending
      )
      break
    default:
      return <p className={className || ''}>{NON_PURCHASE_RELATED_MESSAGE}</p>
    }

    return (
      <div className={`message${className ? ` ${className}` : ''}`}>
        {message}
      </div>
    )
  }
}

export default injectIntl(NotificationMessage)
