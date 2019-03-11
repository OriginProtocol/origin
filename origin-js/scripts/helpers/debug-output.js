const pjson = require('../../package.json')
const Web3 = require('web3')
const truffleContractAddresses = require('./contract-addresses')

const EXPLICIT_ENV_WHITELIST = [
  'NODE',
  'DEBUG',
  'LANG',
  'NVM_DIR',
  'WALLET_LINKER_URL',
  'MOBILE_LOCALHOST_IP',
  'PROVIDER_URL',
  'BRIDGE_SERVER_PROTOCOL',
  'IPFS_SWARM',
  'IPFS_DOMAIN',
  'IPFS_API_PORT',
  'IPFS_GATEWAY_PORT',
  'IPFS_GATEWAY_PROTOCOL',
  'DISCOVERY_SERVER_URL',
  'MESSAGING_NAMESPACE',
  'ARBITRATOR_ACCOUNT',
  'AFFILIATE_ACCOUNT',
  'ATTESTATION_ACCOUNT',
  'BLOCK_EPOCH'
]

/**
 * Check if an env var is whitelisted for debug output
 * @param {string} The env var name
 * @return {bool} If the var is whitelisted
 */
const isWhitelisted = (name) => {
  if (name.startsWith('npm_') || EXPLICIT_ENV_WHITELIST.indexOf(name) > -1) {
    return true
  }
  return false
}

/**
 * Output to console some details for debugging
 */
const debugHeader = async () => {
  console.log('\n')
  console.log('#################################################################')
  console.log('## VERSIONS')
  console.log('## --------------------------------------------------------------')
  console.log(`## origin-js: ${pjson.version}`)
  console.log(`## node: ${process.env.npm_config_node_version}`)
  console.log('#################################################################')
  console.log('## CONTRACTS')
  console.log('## --------------------------------------------------------------')
  const addresses = await truffleContractAddresses()
  for (const key in addresses) {
    console.log(`## ${key}: ${Web3.utils.toChecksumAddress(addresses[key])}`)
  }
  console.log('#################################################################')
  console.log('## ENV')
  console.log('## --------------------------------------------------------------')
  for (const key in process.env) {
    if (isWhitelisted(key)) {
      console.log(`## ${key}: ${process.env[key]}`)
    }
  }
  console.log('#################################################################')
  console.log('\n')
}

module.exports = debugHeader
