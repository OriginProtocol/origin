import context from '../contracts'

export function getOriginListingId(networkId, event) {
  // config addresses are all lowercase
  const version = context.marketplaceVersionByAddress[event.address.toLowerCase()] || '000'
  return `${networkId}-${version}-${event.returnValues.listingID}-${event.blockNumber}`
}

export function getOriginOfferId(networkId, event) {
  const version = context.marketplaceVersionByAddress[event.address] || '000'
  return `${networkId}-${version}-${event.returnValues.listingID}-${event.returnValues.offerID}`
}

export function getListingId(networkId, version, listingId) {
  return `${networkId}-${version}-${listingId}`
}
