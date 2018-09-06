
const statusMap = {
  'created': 1,
  'accepted': 2,
  'disputed': 3,
  'finalized': 4,
  'buyerReviewed': 5
}

/**
 * Convert an offer's status into a step for the UI.
 */
export function offerStatusToStep(status) {
  return statusMap[status] || 0
}