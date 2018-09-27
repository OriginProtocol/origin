const validOwners = {
  // mainnet
  "1": [
    // Empty list means allow all
    // TODO: fill this in
  ],

  // Ropsten
  "3": [
    // Empty list means allow all
  ],

  // Rinkeby
  "4": [
    // Empty list means allow all
  ],

  // development / local blockchain
  "999": [
    // These are the first two accounts for the default local blockchain started
    // by origin.js. There's no practical reason to have these, other than to
    // test.
    '0x627306090abaB3A6e1400e9345bC60c78a8BEf57',
    '0xf17f52151ebef6c7334fad080c5704d77216b732'
  ],
}

/**
 * Returns true if the given owner address is in the list of valid token owners
 * for the given network ID. This helps prevent transferring of accidentally
 * transferring ownership to an address not under your control.
 * @param {string} networkId - Ethereum network ID.
 * @param {string} newOwner - Address of the new owner.
 */
const isValidOwner = (networkId, newOwner, validOwners = validOwners) => {
  const newOwnerLower = newOwner.toLowerCase()
  const whitelist = validOwners[networkId]
  if (typeof whitelist === undefined) {
    throw new Error(`No whitelist defined for network ${networkId}`)
  }
  if (whitelist.length === 0) {
    return true
  }
  return whitelist.filter(address => address.toLowerCase() === newOwnerLower).length > 0
}

module.exports = { isValidOwner, validOwners }
