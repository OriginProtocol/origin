const statusMap = {
  created: 1,
  accepted: 2,
  disputed: undefined, // TODO: Set this once dispute/arbitration implemented.
  finalized: 3,
  sellerReviewed: undefined // There is no next step on either side once in this state.
}

/**
 * Converts an offer's status into a step for the UI.
 */
export function offerStatusToStep(status) {
  return statusMap[status] || 0
}
