import React, { Component } from 'react'
import { defineMessages, injectIntl } from 'react-intl'

// support other derived notifications in the future
const NON_PURCHASE_RELATED_MESSAGE =
  'A message from Origin that does not involve a listing'

class NotificationMessage extends Component {
  constructor(props) {
    super(props)

    const intlMessages = defineMessages({
      //
      // Notifications received by the seller.
      //
      sellerOfferCreated: {
        id: 'notification.sellerOfferCreated',
        defaultMessage: 'You have a new offer.'
      },
      sellerOfferFinalized: {
        id: 'notification.sellerOfferFinalized',
        defaultMessage: 'Your transaction has been completed.'
      },
      sellerOfferDisputed: {
        id: 'notification.sellerOfferDisputed',
        defaultMessage: 'A problem has been reported with your transaction.'
      },
      sellerOfferWithdrawn: {
        id: 'notification.sellerOfferWithdrawn',
        defaultMessage: 'An offer on your listing has been withdrawn.'
      },
      sellerOfferRuling: {
        id: 'notification.sellerOfferRuling',
        defaultMessage: 'A ruling has been issued on your disputed transaction.'
      },
      //
      // Notifications received by the buyer.
      //
      buyerOfferAccepted: {
        id: 'notification.buyerOfferAccepted',
        defaultMessage: 'An offer you made has been accepted.'
      },
      buyerOfferDisputed: {
        id: 'notification.buyerOfferDisputed',
        defaultMessage: 'A problem has been reported with your transaction.'
      },
      buyerOfferRuling: {
        id: 'notification.buyerOfferRuling',
        defaultMessage: 'A ruling has been issued on your disputed transaction.'
      },
      buyerOfferReview: {
        id: 'notification.buyerOfferReview',
        defaultMessage: 'A review has been left on your transaction.'
      },
      buyerOfferWithdrawn: {
        id: 'notification.buyerOfferWithdrawn',
        defaultMessage: 'An offer you made has been rejected.'
      }

    })

    this.notificationTypeToMessage = {
      'seller_offer_created': intlMessages.sellerOfferCreated,
      'seller_offer_finalized': intlMessages.sellerOfferFinalized,
      'seller_offer_disputed': intlMessages.sellerOfferDisputed,
      'seller_offer_ruling': intlMessages.sellerOfferRuling,
      'seller_offer_withdrawn': intlMessages.sellerOfferWithdrawn,
      'buyer_offer_accepted': intlMessages.buyerOfferAccepted,
      'buyer_offer_disputed': intlMessages.sellerOfferDisputed,
      'buyer_offer_ruling': intlMessages.buyerOfferRuling,
      'buyer_offer_review': intlMessages.buyerOfferReview,
      'buyer_offer_withdrawn': intlMessages.buyerOfferWithdrawn,
    }
  }

  render() {
    const { className, type } = this.props
    let message = this.notificationTypeToMessage[type]
    if (!message) {
      return <p className={className || ''}>{NON_PURCHASE_RELATED_MESSAGE}</p>
    }
    message = this.props.intl.formatMessage(message)
    return (
      <div className={`message${className ? ` ${className}` : ''}`}>
        {message}
      </div>
    )
  }
}

export default injectIntl(NotificationMessage)
