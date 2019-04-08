// Email templates
const fs = require('fs')


const templateDir = `${__dirname}/../templates`

const sellerEventNotificationMapEmail = {
  OfferCreated: {
    title: 'New Offer',
    body: fs
      .readFileSync(`${templateDir}/OfferCreated.txt`)
      .toString()
  },
  OfferWithdrawn: {
    title: 'Offer Withdrawn',
    body: fs
      .readFileSync(`${templateDir}/OfferWithdrawn.txt`)
      .toString()
  },
  OfferDisputed: {
    title: 'Dispute Initiated',
    body: fs
      .readFileSync(`${templateDir}/OfferDisputed.txt`)
      .toString()
  },
  OfferRuling: {
    title: 'Dispute Resolved',
    body: fs
      .readFileSync(`${templateDir}/OfferRuling.txt`)
      .toString()
  },
  OfferFinalized: {
    title: 'Sale Completed',
    body: fs
      .readFileSync(`${templateDir}/OfferFinalized.txt`)
      .toString()
  }
}

const buyerEventNotificationMapEmail = {
  OfferWithdrawn: {
    title: 'Offer Rejected',
    body: fs
      .readFileSync(`${templateDir}/OfferWithdrawn.txt`)
      .toString()
  },
  OfferAccepted: {
    title: 'Offer Accepted',
    body: fs
      .readFileSync(`${templateDir}/OfferAccepted.txt`)
      .toString()
  },
  OfferDisputed: {
    title: 'Dispute Initiated',
    body: fs
      .readFileSync(`${templateDir}/OfferDisputed.txt`)
      .toString()
  },
  OfferRuling: {
    title: 'Dispute Resolved',
    body: fs
      .readFileSync(`${templateDir}/OfferRuling.txt`)
      .toString()
  },
  OfferData: {
    title: 'New Review',
    body: fs
      .readFileSync(`${templateDir}/OfferData.txt`)
      .toString()
  }
}


// ----------
//
//
const sellerEventNotificationMap = {
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
}

const buyerEventNotificationMap = {
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
}

/**
 * Returns true if an event should be processed based on its event name.
 * @param {string} eventName - ex: OfferCreated
 * @return {boolean}
 */
function processableEvent(eventName) {
  return (
    (buyerEventNotificationMap[eventName] ||
      sellerEventNotificationMap[eventName]) !== undefined
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
  recipientRole
) {
  // No need to send a notification if recipient initiated the action.
  if (initiator === recipient) {
    return null
  }

  let message
  if (recipientRole === 'buyer') {
    message = buyerEventNotificationMap[eventName]
  } else {
    message = sellerEventNotificationMap[eventName]
  }
  return message ? message : null
}

module.exports = { getNotificationMessage, processableEvent }
