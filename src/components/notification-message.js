import React, { Component } from 'react'
import { defineMessages, injectIntl } from 'react-intl'

// support other derived notifications in the future
const NON_PURCHASE_RELATED_MESSAGE =
  'A message from Origin that does not involve a listing'

class NotificationMessage extends Component {
  constructor(props) {
    super(props)

    this.intlMessages = defineMessages({
      offerMade: {
        id: 'notification.offerMade',
        defaultMessage: 'You have a new offer.'
      },
      offerAccepted: {
        id: 'notification.purchaseSent',
        defaultMessage: 'Your offer has been accepted.'
      },
      saleConfirmed: {
        id: 'notification.saleConfirmed',
        defaultMessage: 'Your sale has been confirmed.'
      },
      sellerReviewed: {
        id: 'notification.sellerReviewed',
        defaultMessage: 'You have a new review.'
      }
    })
  }

  render() {
    const { className, type } = this.props
    let message

    switch (type) {
    case 'buyer_review_received':
      message = this.props.intl.formatMessage(this.intlMessages.sellerReviewed)
      break
    case 'seller_review_received':
      message = this.props.intl.formatMessage(this.intlMessages.saleConfirmed)
      break
    case 'buyer_listing_shipped':
      message = this.props.intl.formatMessage(this.intlMessages.offerAccepted)
      break
    case 'seller_listing_purchased':
      message = this.props.intl.formatMessage(
        this.intlMessages.offerMade
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
