const Money = require('./Money.json')
const Listing = require('./Listing.json')
const AcceptOffer = require('./AcceptOffer.json')
const Finalize = require('./Finalize.json')
const EIP712Domain = require('./EIP712Domain.json')

const name = "Origin Protocol"
const version = "1"

function _toDomain(netId, marketAddress, salt) {
  return {
    name,
    version,
    chainId:netId,
    verifyingContract:marketAddress,
    salt
  }
}

function listingToSignData(netId, marketAddress, salt, listing) {
  const domain = _toDomain(netId, marketAddress, salt)
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

function acceptOfferToSignData(netId, marketAddress, salt, listingID, offerID, ipfsHash, behalfFee) {
  const domain = _toDomain(netId, marketAddress, salt)
  const types = {
    EIP712Domain,
    AcceptOffer
  }
  return {
    types,
    domain,
    primaryType:"AcceptOffer",
    message: { offerID, listingID, ipfsHash, behalfFee}
  }
}

// BehalfFee is always zero for verified transactions
function finalizeToSignData(netId, marketAddress, salt, listingID, offerID, ipfsHash, payOut, behalfFee = 0) {
  const domain = _toDomain(netId, marketAddress, salt)
  const types = {
    EIP712Domain,
    Finalize
  }
  return {
    types,
    domain,
    primaryType:"Finalize",
    message: { offerID, listingID, ipfsHash, payOut, behalfFee }
  }
}


module.exports = { listingToSignData, acceptOfferToSignData, finalizeToSignData }
