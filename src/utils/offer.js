const statusMap = {
  created: 1,
  accepted: 2,
  withdrawn: 2,
  disputed: 2,
  finalized: 3,
  sellerReviewed: 4
}

/**
 * Converts an offer's status into a step for the UI.
 */
export function offerStatusToStep(status) {
  return statusMap[status] || 0
}
