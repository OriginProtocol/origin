const separator = '-'

export function parseListingId(listingId) {
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

export function generateListingId({ version, network, listingIndex }) {
  return [network, version, listingIndex].join(separator)
}

export function parseOfferId(offerId) {
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

export function generateOfferId({ version, network, listingIndex, offerIndex }) {
  return [network, version, listingIndex, offerIndex].join(separator)
}

export function parseNotificationId(notificationId) {
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

export function generateNotificationId({ version, network, transactionHash }) {
  return [network, version, transactionHash].join(separator)
}
