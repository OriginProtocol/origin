const esmImport = require('esm')(module)
const { find, get } = esmImport('lodash')
const ipfs = esmImport('@origin/ipfs')
const ProxyFactoryContract = esmImport(
  '@origin/contracts/build/contracts/ProxyFactory_solc'
)
const IdentityProxyContract = esmImport(
  '@origin/contracts/build/contracts/IdentityProxy_solc'
)
const addresses = esmImport('@origin/contracts/build/contracts_mainnet.json')
const db = {
  ...require('@origin/identity/src/models')
}

const { assert, getListenerBlock, getPastEvents } = require('./utils')

const ATTESTATION_TYPES = [
  'sms',
  'phone',
  //'oAuth', // Not in DB?
  'email',
  'twitter',
  'airbnb',
  'facebook',
  'google',
  'website'
]
const ATTESTATION_TYPE_MAP_DB = {
  sms: 'phone', // TODO: Doesn't exist in db, is phone equivalent?
  phone: 'phone',
  email: 'email',
  twitter: 'twitter',
  airbnb: 'airbnb',
  facebookVerified: 'facebookVerified',
  googleVerified: 'googleVerified',
  website: 'website',
  facebook: 'facebook',
  google: 'google',
  kakao: 'kakao',
  github: 'github',
  linkedin: 'linkedin',
  wechat: 'wechat'
}

/**
 * Normalize addresses to a unified format
 * @param {string} address to normalize
 * @return {string} normalized address
 */
function normalizeAddress(addr) {
  return addr.toLowerCase()
}

/**
 * Get the bytecode for an IdentityProxy instance from ProxyFactory
 * @param {web3} instance of Web3
 * @param {ProxyFactory} instance of ProxyFactory Web3 Contract
 * @param {ProxyImp} the IdentityProxy implementation
 * @returns {string} bytecode
 */
const proxyCreationCode = async (web3, ProxyFactory, ProxyImp) => {
  let code = await ProxyFactory.methods.proxyCreationCode().call()
  code += web3.eth.abi.encodeParameter('uint256', ProxyImp._address).slice(2)
  return code
}

/**
 * Get the bytecode for an IdentityProxy instance from ProxyFactory
 * @param {web3} instance of Web3
 * @param {ProxyFactory} instance of ProxyFactory Web3 Contract
 * @param {ProxyImp} the IdentityProxy implementation
 * @param {address} the address of the user creating a proxy
 * @returns {string} the predicted address of the deployed user proxy
 */
async function predictedProxy(web3, ProxyFactory, ProxyImp, address) {
  const salt = web3.utils.soliditySha3(address, 0)
  const creationCode = await proxyCreationCode(web3, ProxyFactory, ProxyImp)
  const creationHash = web3.utils.sha3(creationCode)

  // Expected proxy address can be worked out thus:
  const create2hash = web3.utils
    .soliditySha3('0xff', ProxyFactory._address, salt, creationHash)
    .slice(-40)

  return web3.utils.toChecksumAddress(`0x${create2hash}`)
}

/**
 * Get the attestation object from the JSON object
 */
function getAttestation(attestationArray, name) {
  const path = `data.attestation.verificationMethod.${name}`
  return find(attestationArray, o => {
    if (get(o, path)) {
      return o
    }
  })
}

/**
 * Get the DB equivalent value for an attestation
 */
function getAttestationDBRepr(attestationDBRecord, name) {
  if (name === 'facebook' || name === 'google') {
    // For backward comptability
    // If userId is not stored in the database, return boolean value from the DB
    if (!attestationDBRecord[ATTESTATION_TYPE_MAP_DB[name]]) {
      return attestationDBRecord[ATTESTATION_TYPE_MAP_DB[`${name}Verified`]]
    }
  }
  return attestationDBRecord[ATTESTATION_TYPE_MAP_DB[name]]
}

/**
 * Compare the provided JSON to the provided database record
 */
function validateIPFSToDB(ipfsJson, ownerRecord, validAddresses) {
  // TODO: IPFS hash column should be added to table and verified here
  const owner = ownerRecord[0].dataValues

  assert(ipfsJson.profile, 'Profile missing in JSON')
  assert(ipfsJson.attestations, 'Attestations missing in JSON')

  const { profile, attestations } = ipfsJson

  // Check profile details
  assert(
    profile.firstName == owner.firstName,
    `Unexpected firstName ${profile.firstName} != ${owner.firstName}`
  )
  assert(
    profile.lastName == owner.lastName,
    `Unexpected lastName  ${profile.lastName} != ${owner.lastName}`
  )
  assert(
    validAddresses.includes(normalizeAddress(profile.ethAddress)),
    `Unexpected ethAddress. ${profile.ethAddress} not in [${validAddresses.join(
      ', '
    )}]`
  )

  // Check attestations
  for (const attName of ATTESTATION_TYPES) {
    const attObj = getAttestation(attestations, attName)
    const attestationValueJSON = get(
      attObj,
      `data.attestation.${attName}.verified`
    )
    const attestationValueDB = getAttestationDBRepr(owner, attName)

    if (typeof attestationValueJSON === 'undefined') {
      /**
       * null from DB, undefined from _.get.  Also, this may be false positive
       * when things like 'sms' and 'phone' are analogous
       */
      if (
        attestationValueDB !== null &&
        ['sms', 'phone'].indexOf(attName) < 0
      ) {
        assert(
          attestationValueDB !== null,
          `DB record value for ${attName} attestation should be null if it isn't included`
        )
      }
    } else {
      assert(
        attestationValueJSON === true,
        `Attestation "verified" should be true or not present`
      )

      // We can't really verify the values, but we can make sure they exist
      switch (attName) {
        case 'facebook':
        case 'google':
          assert(
            attestationValueDB,
            `DB Value should be true for ${attName} attestation`
          )
          break
        case 'sms':
        case 'email':
        case 'phone':
        case 'twitter':
        case 'airbnb':
        case 'website':
        default:
          assert(
            attestationValueDB !== null,
            'DB Value should be non-null if attested'
          )
      }
    }
  }
}

/**
 * Verify an identity is what's expected between the IPFS record and database
 */
async function verifyIdent({
  web3,
  log,
  address,
  ipfsGateway,
  ipfsHash,
  contracts
}) {
  address = normalizeAddress(address)
  let proxyAddress
  const validAddresses = [address]

  // If this is not already a proxy, figure out the proxy address
  if ((await web3.eth.getCode(address)) === '0x') {
    proxyAddress = await predictedProxy(
      web3,
      contracts.ProxyFactory,
      contracts.IdentityProxy,
      address
    )
    proxyAddress = normalizeAddress(proxyAddress)
    validAddresses.push(proxyAddress)
  } else {
    // Is proxy
    // Get the owner from the contract and add it to the array of valid addresses
    const UserProxy = await contracts.IdentityProxy.clone()
    UserProxy.options.address = address
    const owner = await UserProxy.methods.owner().call()
    proxyAddress = address
    address = normalizeAddress(owner)
    validAddresses.unshift(address)
  }

  const owner = await db.Identity.findAll({
    where: {
      eth_address: address
    }
  })

  // Make sure we have the expected amount of records
  if (owner.length < 1) {
    log.error(
      `Did not find a matching record for address ${address}(or proxy ${proxyAddress})`
    )
    return false
  } else if (owner.length > 1) {
    log.error(`Too many records found(${owner.length})!`)
    return false
  }

  log.debug(`Found ${owner.length} matching records`)

  // Fetch the IPFS data
  let qmHash, ipfsJson
  try {
    qmHash = ipfs.getIpfsHashFromBytes32(ipfsHash)
    ipfsJson = await ipfs.get(ipfsGateway, qmHash)
  } catch (err) {
    log.error(`Error retrieving IPFS data for ${qmHash}`)
    log.error(err)
  }

  log.debug(
    `Comparing IPFS Identity ${address}(proxy: ${proxyAddress}) - ${qmHash}`
  )

  if (!ipfsJson) {
    log.error(`IPFS Data missing at ${ipfsGateway}/ipfs/${qmHash}`)
    return false
  }

  // Make sure the record is sane
  try {
    validateIPFSToDB(ipfsJson, owner, validAddresses)
  } catch (err) {
    // Handle Assertion errors
    if (err.name === 'AssertionError') {
      log.error(
        `Identity validation failed  for ${address}(proxy: ${proxyAddress}): ${err.toString()}`
      )
      return false
    } else {
      throw err
    }
  }
  return true
}

/**
 * Validate that all idents are what is expected
 */
async function validateIdentities({
  web3,
  log,
  contractsContext,
  fromBlock = 0,
  toBlock = 'latest',
  ipfsGateway = 'https://ipfs.originprotocol.com'
}) {
  const identityEvents = contractsContext.identityEvents
  const identities = {}
  const latestEvents = {}

  const ProxyFactory = new web3.eth.Contract(
    ProxyFactoryContract.abi,
    addresses.ProxyFactory
  )

  const IdentityProxy = new web3.eth.Contract(
    IdentityProxyContract.abi,
    addresses.IdentityProxyImplementation
  )

  // Only fetch up to where the listener is reported to be at, don't get ahead
  // of it
  if (toBlock === 'latest') {
    toBlock = await getListenerBlock('main', 'IdentityEvents_')
  }

  const events = await getPastEvents(identityEvents, 'allEvents', {
    fromBlock,
    toBlock
  })

  assert(events.length > 0, 'No events to check')

  // Build up an object with the expected IPFS hash for each ident
  let lastBlock = 0
  for (const event of events) {
    assert(event.blockNumber >= lastBlock, 'Events out of order!')

    if (event.event == 'IdentityUpdated') {
      identities[event.returnValues.account] = event.returnValues.ipfsHash
      latestEvents[event.returnValues.account] = event
    } else if (event.event == 'IdentityDeleted') {
      delete identities[event.returnValues.account]
    }

    lastBlock = event.blockNumber
  }

  // Verify the IPFS data against the IPFS table
  for (const address of Object.keys(identities)) {
    let verified = false
    try {
      verified = await verifyIdent({
        web3,
        log,
        address,
        ipfsGateway,
        ipfsHash: identities[address],
        contracts: {
          ProxyFactory,
          IdentityProxy
        }
      })
    } catch (err) {
      log.error(err)
    }

    if (!verified) {
      log.info(`Identity verification for account ${address} failed.`)
      log.debug('Event: ', latestEvents[address])
    }
  }
}

module.exports = {
  validateIdentities
}
