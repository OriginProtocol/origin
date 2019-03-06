import React, { Component } from 'react'
import { FormattedMessage, defineMessages, injectIntl } from 'react-intl'

import TransactionEvent from 'components/transaction-event'

import { formattedAddress } from 'utils/user'
import { getOfferEvents } from 'utils/offer'

class TransactionHistory extends Component {
  constructor(props) {
    super(props)

    this.intlMessages = defineMessages({
      offerMade: {
        id: 'transaction-history.offerMade',
        defaultMessage: 'Offer Made'
      },
      offerRejected: {
        id: 'transaction-history.offerRejected',
        defaultMessage: 'Offer Rejected'
      },
      offerWithdrawn: {
        id: 'transaction-history.offerWithdrawn',
        defaultMessage: 'Offer Withdrawn'
      },
      offerAccepted: {
        id: 'transaction-history.offerAccepted',
        defaultMessage: 'Offer Accepted'
      },
      offerDisputed: {
        id: 'transaction-history.offerDisputed',
        defaultMessage: 'Dispute Started'
      },
      offerRuling: {
        id: 'transaction-history.offerRuling',
        defaultMessage: 'Ruling Made'
      },
      saleCompleted: {
        id: 'transaction-history.saleCompleted',
        defaultMessage: 'Sale Completed'
      },
      saleReviewed: {
        id: 'transaction-history.saleReviewed',
        defaultMessage: 'Sale Reviewed'
      }
    })
  }

  render() {
    const { purchase } = this.props
    const offerEvents = getOfferEvents(purchase)
    const [
      offerCreated,
      offerWithdrawn,
      offerAccepted,
      offerDisputed,
      offerRuling,
      offerFinalized,
      offerData
    ] = offerEvents

    const withdrawnOrRejected = offerWithdrawn ? (
      formattedAddress(purchase.buyer) === offerWithdrawn.returnValues.party ? 'withdrawn' : 'rejected'
    ) : null

    return (
      <table className="table table-striped">
        <thead>
          <tr>
            <th scope="col" style={{ width: '200px' }}>
              <FormattedMessage
                id={'purchase-detail.txName'}
                defaultMessage={'TxName'}
              />
            </th>
            <th scope="col">
              <FormattedMessage
                id={'purchase-detail.txHash'}
                defaultMessage={'TxHash'}
              />
            </th>
          </tr>
        </thead>
        <tbody>
          <TransactionEvent
            eventName={this.props.intl.formatMessage(
              this.intlMessages.offerMade
            )}
            event={offerCreated}
          />
          {offerWithdrawn && withdrawnOrRejected === 'rejected' && (
            <TransactionEvent
              eventName={this.props.intl.formatMessage(
                this.intlMessages.offerRejected
              )}
              event={offerWithdrawn}
            />
          )}
          {offerWithdrawn && withdrawnOrRejected === 'withdrawn' && (
            <TransactionEvent
              eventName={this.props.intl.formatMessage(
                this.intlMessages.offerWithdrawn
              )}
              event={offerWithdrawn}
            />
          )}
          <TransactionEvent
            eventName={this.props.intl.formatMessage(
              this.intlMessages.offerAccepted
            )}
            event={offerAccepted}
          />
          <TransactionEvent
            eventName={this.props.intl.formatMessage(
              this.intlMessages.offerDisputed
            )}
            event={offerDisputed}
            danger={!offerRuling}
          />
          <TransactionEvent
            eventName={this.props.intl.formatMessage(
              this.intlMessages.offerRuling
            )}
            event={offerRuling}
          />
          <TransactionEvent
            eventName={this.props.intl.formatMessage(
              this.intlMessages.saleCompleted
            )}
            event={offerFinalized}
          />
          <TransactionEvent
            eventName={this.props.intl.formatMessage(
              this.intlMessages.saleReviewed
            )}
            event={offerData}
          />
        </tbody>
      </table>
    )
  }
}

export default injectIntl(TransactionHistory)
