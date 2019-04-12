const { messageTemplates } = require('../templates/messageTemplates')

if (!messageTemplates) {
  console.error('error: messageTemplates not found.')
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
