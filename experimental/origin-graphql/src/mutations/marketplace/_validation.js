import contracts from '../../contracts'

export async function validateOffer(data, listingId, offerId) {
  const web3 = contracts.web3
  const listing = await contracts.eventSource.getListing(listingId)

  const offer = offerId
    ? await contracts.eventSource.getOffer(listingId, offerId)
    : data

  const unitsAvailable = Number(listing.unitsAvailable)
  const offerQuantity = Number(data.quantity)
  if (offerQuantity > unitsAvailable) {
    throw new Error(`Insufficient units available (${unitsAvailable}) for offer (${offerQuantity})`)
  }

  const depositAvailable = web3.utils.toBN(listing.depositAvailable)
  const offerCommission = offer.commission
    ? web3.utils.toBN(offer.commission)
    : web3.utils.toBN(0)
  if (offerCommission.gt(depositAvailable)) {
    throw new Error(`Offer commission exceeds ${offerCommission.toString()} available deposit ${depositAvailable.toString()}`)
  }
}
