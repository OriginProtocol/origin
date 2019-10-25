/**
 * Validates listings by making sure ListingCreated creates DB records, and does
 * cursory checking of the data.
 *
 * TODO: Add support for ListingUpdated events
 */
const esmImport = require('esm')(module)
const db = {
  ...esmImport('@origin/discovery/src/models')
}

const { assert, getListenerBlock, getPastEvents } = require('./utils')

async function listingCreatedEvents(contract, fromBlock, toBlock, prefix) {
  if (!toBlock || toBlock === 'latest') {
    toBlock = await getListenerBlock('main', prefix)
  }
  return await getPastEvents(contract, 'ListingCreated', {
    fromBlock,
    toBlock
  })
}

async function verifyListingDBRecord(netId, version, event) {
  const listingId = event.returnValues.listingID
  const fqListingID = `${netId}-${version}-${listingId}`

  const records = await db.Listing.findAll({
    where: {
      id: fqListingID
    },
    order: [['block_number', 'DESC'], ['log_index', 'DESC']]
  })

  // Make sure we have at least one record (there can be multiple indicating
  // revisions)
  assert(
    records.length > 0,
    `Did not find a matching record for listing #${listingId}`
  )

  // Should be the latest revision
  const latestListing = records[0]
  const firstListing = records[records.length - 1]

  // Some super basic verification
  // TODO: Fill out?
  assert(
    firstListing.blockNumber === event.blockNumber,
    `Listing mismatch for blockNumber: ${firstListing.blockNumber} != ${event.blockNumber}`
  )
  assert(
    firstListing.logIndex === event.logIndex,
    `Listing mismatch for logIndex: ${firstListing.logIndex} != ${event.logIndex}`
  )
  assert(
    firstListing.sellerAddress === event.returnValues.party.toLowerCase(),
    `Listing mismatch for sellerAddress: ${
      firstListing.sellerAddress
    } != ${event.returnValues.party.toLowerCase()}`
  )
  assert(
    latestListing.sellerAddress === event.returnValues.party.toLowerCase(),
    `Listing mismatch for sellerAddress: ${
      latestListing.sellerAddress
    } != ${event.returnValues.party.toLowerCase()}`
  )

  return true
}

/**
 * Verify that listing DB records have been created for every ListingCreated
 * event
 *
 * @param args {object} map of function arguments
 */
async function validateListings({ log, contractsContext, fromBlock }) {
  for (const version in contractsContext.marketplaces) {
    const events = await listingCreatedEvents(
      contractsContext.marketplaces[version].contract,
      fromBlock || contractsContext.marketplaces[version].epoch || 0,
      'latest',
      `V${version}_Marketplace_`
    )

    const netId = await contractsContext.web3.eth.net.getId()

    log.debug(`Found ${events.length} ListingCreated events`)

    for (const ev of events) {
      try {
        const valid = await verifyListingDBRecord(netId, version, ev)
        if (valid) {
          log.debug('Listing valid. :)')
        }
      } catch (err) {
        if (err.name === 'AssertionError') {
          log.error(
            `Unable to validate ${ev.event} event for listing #${netId}-${version}-${ev.returnValues.listingID},  transaction ${ev.transactionHash}`
          )
          log.error(err.toString())
        } else {
          throw err
        }
      }
    }
  }
}

module.exports = {
  validateListings
}
