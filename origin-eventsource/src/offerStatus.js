function offerStatus(offer) {
  const status = Number(offer.status)
  if (status === 0) {
    if (offer.withdrawnBy && offer.withdrawnBy.id !== offer.buyer.id) {
      return 'Declined'
    }
    return 'Withdrawn'
  }
  if (status === 1) {
    return 'Pending'
  }
  if (status === 2) {
    return 'Accepted'
  }
  if (status === 3) {
    return 'Disputed'
  }
  if (status === 4 || status === 6) {
    return 'Finalized'
  }
  if (status === 5) {
    return 'Dispute Resolved'
  }
  return status
}

module.exports = offerStatus
