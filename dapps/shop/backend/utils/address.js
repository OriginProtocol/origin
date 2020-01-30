const Web3 = require('web3')

const { NETWORK_ID, CONTRACTS } = require('./const')

const VERSION_TO_ADDRESS = CONTRACTS[NETWORK_ID].marketplace
const ADDRESS_TO_VERSION = {}

Object.keys(CONTRACTS[NETWORK_ID].marketplace).map(k => {
  const v = CONTRACTS[NETWORK_ID].marketplace[k]
  return (ADDRESS_TO_VERSION[v] = k)
})

function addressToVersion(addr) {
  const normAddr = Web3.utils.toChecksumAddress(addr)
  return ADDRESS_TO_VERSION[normAddr]
}

function versionToAddress(vers) {
  const normVers = parseInt(vers)
  return VERSION_TO_ADDRESS[normVers]
}

function normalizeAddress(addr) {
  return Web3.utils.toChecksumAddress(addr)
}

module.exports = {
  addressToVersion,
  versionToAddress,
  normalizeAddress
}
