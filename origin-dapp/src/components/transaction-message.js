import React, { Component } from 'react'
import { defineMessages, injectIntl } from 'react-intl'

// support uncategorized transactions
const UNCATEGORIZED_MESSAGE = 'A transaction is awaiting confirmation'

class TransactionMessage extends Component {
  constructor(props) {
    super(props)

    this.intlMessages = defineMessages({
      acceptOffer: {
        id: 'transaction.acceptOffer',
        defaultMessage: 'You accepted an offer.'
      },
      makeOffer: {
        id: 'transaction.makeOffer',
        defaultMessage: 'You made an offer.'
      },
      withdrawOffer: {
        id: 'transaction.withdrawOffer',
        defaultMessage: 'You withdrew an offer.'
      },
      reserveListing: {
        id: 'transaction.reserveListing',
        defaultMessage: 'You reserved a listing.',
      },
      closeListing: {
        id: 'transaction.closeListing',
        defaultMessage: 'You closed a listing.'
      },
      completePurchase: {
        id: 'transaction.completePurchase',
        defaultMessage: 'You completed a purchase.'
      },
      createListing: {
        id: 'transaction.createListing',
        defaultMessage: 'You created a listing.'
      },
      initiateDispute: {
        id: 'transaction.initiateDispute',
        defaultMessage: 'You initiated a dispute.'
      },
      reviewSale: {
        id: 'transaction.reviewSale',
        defaultMessage: 'You left a review.'
      },
      updateProfile: {
        id: 'transaction.updateProfile',
        defaultMessage: 'You updated your profile.'
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
