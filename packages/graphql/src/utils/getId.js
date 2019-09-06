export function getOriginListingId(networkId, event) {
  return `${networkId}-000-${event.returnValues.listingID}-${event.blockNumber}`
}

export function getOriginOfferId(networkId, event) {
  return `${networkId}-000-${event.returnValues.listingID}-${event.returnValues.offerID}`
}

export function getListingId(networkId, version, listingId) {
  return `${networkId}-${version}-${listingId}`
}
