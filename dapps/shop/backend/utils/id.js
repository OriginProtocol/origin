const { versionToAddress } = require('./address')

const DEFAULT_NET_ID = 1
const DEFAULT_CONTRACT_VERSION = '001'

class ListingID {
  constructor(
    listingId = null,
    networkId = DEFAULT_NET_ID,
    contractVersion = DEFAULT_CONTRACT_VERSION
  ) {
    if (!listingId) return
    this.listingId = listingId
    this.networkId = networkId
    this.contractVersion = contractVersion
  }

  static fromFQLID(fqid) {
    if (!fqid) {
      throw new TypeError('fqid not provided')
    }
    const [netId, vers, listingID] = fqid.split('-')
    return new ListingID(listingID, netId, vers)
  }

  address() {
    return versionToAddress(this.contractVersion)
  }

  toString() {
    return `${this.networkId}-${this.contractVersion}-${this.listingId}`
  }
}

class OfferID {
  constructor(
    listingId,
    offerId,
    networkId = DEFAULT_NET_ID,
    contractVersion = DEFAULT_CONTRACT_VERSION
  ) {
    if (!listingId) return
    this.listingId = listingId
    this.offerId = offerId
    this.networkId = networkId
    this.contractVersion = contractVersion
  }

  toString() {
    return `${this.networkId}-${this.contractVersion}-${this.listingId}-${this.offerId}`
  }
}

function fqlid(listingID, netId, contractVersion) {
  return new ListingID(listingID, netId, contractVersion)
}

function fqoid(listingID, offerID, netId, contractVersion) {
  return new OfferID(listingID, offerID, netId, contractVersion)
}

module.exports = {
  ListingID,
  OfferID,
  fqlid,
  fqoid
}
