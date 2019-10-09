import context from '../contracts'

export function getOriginListingId(networkId, event) {
  const address = context.web3.utils.toChecksumAddress(event.address)
  const version = context.marketplaceVersionByAddress[address] || '000'
  return `${networkId}-${version}-${event.returnValues.listingID}-${event.blockNumber}`
}

export function getOriginOfferId(networkId, event) {
  const address = context.web3.utils.toChecksumAddress(event.address)
  const version = context.marketplaceVersionByAddress[address] || '000'
  return `${networkId}-${version}-${event.returnValues.listingID}-${event.returnValues.offerID}`
}

export function getListingId(networkId, version, listingId) {
  return `${networkId}-${version}-${listingId}`
}
