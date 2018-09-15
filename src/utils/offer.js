const statusMap = {
  created: 1,
  accepted: 2,
  withdrawn: 2,
  // while disputed is an offer status, the UI does not call for it as a step
  finalized: 3,
  sellerReviewed: 4
}

/**
 * Converts an offer's status into a step for the UI.
 */
export function offerStatusToStep(status) {
  return statusMap[status] || 0
}
