const Money = require('./Money.json')
const Listing = require('./Listing.json')
const EIP712Domain = require('./EIP712Domain.json')

const name = "Origin Protocol"
const version = "1"

function listingToSignData(netId, marketAddress, salt, listing) {
  const domain = {
    name,
    version,
    chainId:netId,
    verifyingContract:marketAddress,
    salt
  }
  const types = {
    EIP712Domain,
    Money,
    Listing
  }
  return {
    types,
    domain,
    primaryType:"Listing",
    message:listing
  }
}

module.exports = { listingToSignData }
