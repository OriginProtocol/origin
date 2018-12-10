const statusMap = {
  created: 1,
  accepted: 2,
  withdrawn: 2,
  disputed: 3,
  finalized: 3,
  ruling: 4,
  sellerReviewed: 4
}

export function offerStatusToListingAvailability(status) {
  const pendingStates = ['created', 'accepted', 'disputed']
  const soldStates = ['finalized', 'sellerReviewed', 'ruling']

  if (pendingStates.includes(status)) {
    return 'pending'
  } else if (soldStates.includes(status)) {
    return 'sold'
  } else {
    return 'unknown'
  }
}

/**
 * Converts an offer's status into a step for the UI.
 */
export function offerStatusToStep(status) {
  return statusMap[status] || 0
}

export function getOfferEvents(purchase = {}) {
  const purchasePresent = Object.keys(purchase).length

  if (!purchasePresent) return []

  const offerCreated = purchase.event('OfferCreated')
  const offerWithdrawn = purchase.event('OfferWithdrawn')
  const offerAccepted = purchase.event('OfferAccepted')
  const offerDisputed = purchase.event('OfferDisputed')
  const offerRuling = purchase.event('OfferRuling')
  const offerFinalized = purchase.event('OfferFinalized')
  const offerData = purchase.event('OfferData')

  return [
    offerCreated,
    offerWithdrawn,
    offerAccepted,
    offerDisputed,
    offerRuling,
    offerFinalized,
    offerData
  ]
}
