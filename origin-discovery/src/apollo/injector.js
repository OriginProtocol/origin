const db = require('./db')
require('dotenv').config()
try {
  require('envkey')
} catch (error) {
  console.log('EnvKey not configured')
}

const search = require('../lib/search.js')
const urllib = require('url')
const Origin = require('origin').default
const Web3 = require('web3')

const generateListingId = ({ network, version, uniqueId }) => {
  return [network, version, uniqueId].join(
    '-'
  )
}


function setupOriginJS (config, web3) {
  const ipfsUrl = new urllib.URL(config.ipfsUrl)

  // Error out if any mandatory env var is not set.
  if (!config.arbitratorAccount) {
    throw new Error('ARBITRATOR_ACCOUNT not set')
  }
  if (!config.affiliateAccount) {
    throw new Error('AFFILIATE_ACCOUNT not set')
  }
  if (!config.attestationAccount) {
    throw new Error('ATTESTATION_ACCOUNT not set')
  }

  return new Origin({
    ipfsDomain: ipfsUrl.hostname,
    ipfsGatewayProtocol: ipfsUrl.protocol.replace(':', ''),
    ipfsGatewayPort: ipfsUrl.port,
    arbitrator: config.arbitratorAccount,
    affiliate: config.affiliateAccount,
    attestationAccount: config.attestationAccount,
    web3
  })
}

const args = {}
process.argv.forEach(arg => {
  const t = arg.split('=')
  const argVal = t.length > 1 ? t[1] : true
  args[t[0]] = argVal
})


const config = {
  // Verbose mode, includes dumping events on the console.
  verbose: args['--verbose'] || (process.env.VERBOSE === 'true'),
  // ipfs url
  ipfsUrl: args['--ipfs-url'] || process.env.IPFS_URL || 'http://localhost:8080',
  // Origin-js configs
  arbitratorAccount: process.env.ARBITRATOR_ACCOUNT,
  affiliateAccount: process.env.AFFILIATE_ACCOUNT,
  attestationAccount: process.env.ATTESTATION_ACCOUNT,
  elasticsearch: args['--elasticsearch'] || (process.env.ELASTICSEARCH === 'true')
}

const web3Provider = new Web3.providers.HttpProvider(config.web3Url)
const web3 = new Web3(web3Provider)
global.web3 = web3
const origin = setupOriginJS(config, web3)

async function updateSearch(listingId, listing) {
    if (config.elasticsearch) {
      const seller = await origin.users.get(listing.seller)
      console.log(`Indexing listing in Elastic: id=${listingId}`)
      await search.Listing.index(listingId, seller.address, listing.ipfsHash, listing)
      //await search.User.index(seller)
      return true
    }
}


async function _verifyListing(listing, signature) {
  if (!listing.createDate)
  {
    throw new Error('CreateDate required to inject this listing')
  }

  if (listing.ipfs.data.signature != signature)
  {
    throw new Error('signature not encoded into ipfs blob')
  }

  console.log('creator vs seller:', listing.creator, listing.seller)
  if (listing.creator != listing.seller)
  {
    throw new Error('Creator must be same as the seller!')
  }
  //looks like I need a raw response to verify this hash else it hashes the processed one

  if (!(await origin.marketplace.verifyListingSignature(listing, listing.seller)))
  {
    throw new Error('Signature does not match that of the seller')
  }
}

async function injectListing(injectedListingInput, signature) {
  //
  // please very signature first
  //
  console.log('verifying:', injectedListingInput, ' against ', signature)
  // schema ListingInput in graphql
  const listing = await origin.marketplace._listingFromData(undefined, injectedListingInput)

  // set the listing id for the current network
  const network = await origin.contractService.web3.eth.net.getId()
  const listingId = generateListingId({ version: 'A', network, uniqueId: listing.uniqueId })

  listing.id = listingId

  await _verifyListing(listing, signature)

  const existingRow = await db.getListing(listingId)

  if (existingRow) {
    throw new Error('Row already created, update instead')
  }
  const blockNumber = await origin.contractService.web3.eth.getBlockNumber()

  const listingData = {
    id: listingId,
    blockNumber,
    logIndex: 0,
    status: listing.status,
    sellerAddress: listing.seller.toLowerCase(),
    data: listing
  }
  const newListing = await db.createListing(listingData)
  console.log('indexing:', listingId)
  await updateSearch(listingId, listing)
  return newListing
}

async function updateListing(listingId, injectedListingInput, signature) {
  //
  // please very signature first
  //
  // schema ListingInput in graphql
  //
  console.log('verifying:', injectedListingInput, ' against ', signature)
  const existingRow = await db.getListing(listingId)
  const listing = await origin.marketplace._listingFromData(listingId, injectedListingInput)

  if (((existingRow.updateVersion && Number(existingRow.updateVersion)) || 0) 
    >= ((listing.updateVersion && Number(listing.updateVersion)) || 0)) {
    throw new Error('Update date is earlier than the existing date')
  }

  await _verifyListing(listing, signature)

  // cannot change seller address for now
  const blockNumber = await origin.contractService.web3.eth.getBlockNumber()

  const listingData = {
    id: listingId,
    blockNumber,
    logIndex: 0,
    status: listing.status,
    sellerAddress: listing.seller.toLowerCase(),
    data: listing
  }
  const updatedListing = await db.createListing(listingData)
  await updateSearch(listingId, listing)
  return updatedListing
}

module.exports = {
  injectListing,
  updateListing
}
