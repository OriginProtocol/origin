const separator = '-'

function parseListingId(listingId) {
  if (typeof listingId !== 'string') {
    throw new Error(`Listing id ${listingId} must be a string`)
  }
  const exploded = listingId.split(separator)
  if (exploded.length < 3) {
    throw new Error(`Invalid listing id: ${listingId}`)
  }
  const [network, version, listingIndex] = exploded
  return { network, version, listingIndex }
}

function generateListingId({ version, network, listingIndex }) {
  return [network, version, listingIndex].join(separator)
}

function parseOfferId(offerId) {
  if (typeof offerId !== 'string') {
    throw new Error(`Offer id ${offerId} must be a string`)
  }
  const exploded = offerId.split(separator)
  if (exploded.length < 4) {
    throw new Error(`Invalid offer id: ${offerId}`)
  }
  const [network, version, listingIndex, offerIndex] = exploded
  return { network, version, listingIndex, offerIndex }
}

function generateOfferId({ version, network, listingIndex, offerIndex }) {
  return [network, version, listingIndex, offerIndex].join(separator)
}

function parseNotificationId(notificationId) {
  if (typeof notificationId !== 'string') {
    throw new Error(`Notification id ${notificationId} must be a string`)
  }
  const exploded = notificationId.split(separator)
  if (exploded.length < 3) {
    throw new Error(`Invalid notification id: ${notificationId}`)
  }
  const [network, version, transactionHash] = exploded
  return { network, version, transactionHash }
}

function generateNotificationId({ version, network, transactionHash }) {
  return [network, version, transactionHash].join(separator)
}

module.exports = {
  parseListingId,
  generateListingId,
  parseOfferId,
  generateOfferId,
  parseNotificationId,
  generateNotificationId
}
