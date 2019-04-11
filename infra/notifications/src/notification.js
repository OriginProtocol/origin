const _ = require('lodash')

const messageTemplates = {
  seller: {
    mobile: {
      OfferCreated: {
        title: 'New Offer',
        body: 'A buyer has made an offer on your listing.'
      },
      OfferWithdrawn: {
        title: 'Offer Withdrawn',
        body: 'An offer on your listing has been withdrawn.'
      },
      OfferDisputed: {
        title: 'Dispute Initiated',
        body: 'A problem has been reported with your transaction.'
      },
      OfferRuling: {
        title: 'Dispute Resolved',
        body: 'A ruling has been issued on your disputed transaction.'
      },
      OfferFinalized: {
        title: 'Sale Completed',
        body: 'Your transaction has been completed.'
      }
    },
    email: {
      OfferCreated: {
        subject: 'New Offer',
        html: _.template('A buyer has made an offer on your listing.'),
        text: _.template('A buyer has made an offer on your listing.')
      },
      OfferWithdrawn: {
        subject: 'Offer Withdrawn',
        html: _.template('An offer on your listing has been withdrawn.'),
        text: _.template('An offer on your listing has been withdrawn.')
      },
      OfferDisputed: {
        subject: 'Dispute Initiated',
        html: _.template('A problem has been reported with your transaction.'),
        text: _.template('A problem has been reported with your transaction.')
      },
      OfferRuling: {
        subject: 'Dispute Resolved',
        html: _.template(
          'A ruling has been issued on your disputed transaction.'
        ),
        text: _.template(
          'A ruling has been issued on your disputed transaction.'
        )
      },
      OfferFinalized: {
        subject: 'Sale Completed',
        html: _.template(
          'Your transaction with <em><%= offer.buyer.identity.fullName %></em> for <em><%= listing.title %></em> has been completed. <%= listing.id %> '
        ),
        text: _.template(
          'Your transaction with <%= offer.buyer.identity.fullName %> for "<%= listing.title %>" has been completed. <%= listing.id %> '
        )
      }
    }
  },
  buyer: {
    mobile: {
      OfferWithdrawn: {
        title: 'Offer Rejected',
        body: 'An offer you made has been rejected.'
      },
      OfferAccepted: {
        title: 'Offer Accepted',
        body: 'An offer you made has been accepted.'
      },
      OfferDisputed: {
        title: 'Dispute Initiated',
        body: 'A problem has been reported with your transaction.'
      },
      OfferRuling: {
        title: 'Dispute Resolved',
        body: 'A ruling has been issued on your disputed transaction.'
      },
      OfferData: {
        title: 'New Review',
        body: 'A review has been left on your transaction.'
      }
    },
    email: {
      OfferWithdrawn: {
        subject: 'Offer Rejected',
        html: _.template('An offer you made has been rejected.'),
        text: _.template('An offer you made has been rejected.')
      },
      OfferAccepted: {
        subject: 'Offer Accepted',
        html: _.template('An offer you made has been accepted.'),
        text: _.template('An offer you made has been accepted.')
      },
      OfferDisputed: {
        subject: 'Dispute Initiated',
        html: _.template('A problem has been reported with your transaction.'),
        text: _.template('A problem has been reported with your transaction.')
      },
      OfferRuling: {
        subject: 'Dispute Resolved',
        html: _.template(
          'A ruling has been issued on your disputed transaction.'
        ),
        text: _.template(
          'A ruling has been issued on your disputed transaction.'
        )
      },
      OfferData: {
        subject: 'New Review',
        html: _.template('A review has been left on your transaction.'),
        text: _.template('A review has been left on your transaction.')
      }
    }
  }
}

/**
 * Returns true if an event should be processed based on its event name.
 * @param {string} eventName - ex: OfferCreated
 * @return {boolean}
 */
function processableEvent(eventName, channel) {
  return (
    (messageTemplates.buyer[channel][eventName] ||
      messageTemplates.seller[channel][eventName]) !== undefined
  )
}

/**
 * Returns notification message.
 * TODO: localize message based on user profile/preferences.
 *
 * @param {string} eventName - Ex: OfferCreated.
 * @param {string} initiator - Address of the user who initiated the action.
 * @param {string} recipient - Address of the notification recipient.
 * @param {string} recipientRole - 'buyer' or 'seller'
 * @return {title: string, body: string} - Notification message or null if no notification
 *   should be sent.
 */
function getNotificationMessage(
  eventName,
  initiator,
  recipient,
  recipientRole,
  channel
) {
  // No need to send a notification if recipient initiated the action.
  if (initiator === recipient) {
    return null
  }

  let message
  if (recipientRole === 'buyer') {
    message = messageTemplates.buyer[channel][eventName]
  } else {
    message = messageTemplates.seller[channel][eventName]
  }
  return message ? message : null
}

module.exports = { getNotificationMessage, processableEvent }
