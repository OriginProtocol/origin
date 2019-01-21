import contracts from '../../contracts'

export async function validateNewOffer(listingId, data) {
  const listing = await contracts.eventSource.getListing(listingId)

  const unitsAvailable = Number(listing.unitsAvailable)
  const offerQuantity = Number(data.quantity)
  if (offerQuantity > unitsAvailable) {
    throw new Error(`Insufficient units available (${unitsAvailable}) for offer (${offerQuantity})`)
  }

  const web3 = contracts.web3
  const depositAvailable = web3.utils.toBN(listing.depositAvailable)
  const offerCommission = data.commission
    ? web3.utils.toBN(data.commission)
    : web3.utils.toBN(0)
  if (offerCommission.gt(depositAvailable)) {
    throw new Error(`Offer commission exceeds ${offerCommission.toString()} available deposit ${depositAvailable.toString()}`)
  }
}

export async function validateOffer(listingId, offerId) {
  const offer = await contracts.eventSource.getOffer(listingId, offerId)
  if (!offer.valid) {
    throw new Error(`Invalid offer: ${offer.validationError}`)
  }
}
