const db = {
  ...require('../../../models')
}

const log = require('../../logger')
const { assert, getListenerBlock, getPastEvents } = require('./utils')

async function listingCreatedEvents(contract, fromBlock, toBlock) {
  if (!toBlock || toBlock === 'latest') {
    toBlock = await getListenerBlock('main', 'Marketplace_')
  }
  return await getPastEvents(contract, 'ListingCreated', {
    fromBlock,
    toBlock
  })
}

async function verifyListingDBRecord(netId, event) {
  const listingId = event.returnValues.listingID
  const fqListingID = `${netId}-000-${listingId}`

  const records = await db.Listing.findAll({
    where: {
      id: fqListingID
    }
  })

  // Make sure we have the expected amount of records
  assert(
    records.length > 0,
    `Did not find a matching record for listing #${listingId}`
  )
  assert(records.length < 2, `Found too many records for listing #${listingId}`)

  const listing = records[0]

  // Some super basic verification
  // TODO: Fill out?
  assert(
    listing.blockNumber === event.blockNumber,
    `Listing mismatch for blockNumber: ${listing.blockNumber} != ${
      event.blockNumber
    }`
  )
  assert(
    listing.logIndex === event.logIndex,
    `Listing mismatch for logIndex: ${listing.logIndex} != ${event.logIndex}`
  )
  assert(
    listing.sellerAddress === event.returnValues.party.toLowerCase(),
    `Listing mismatch for sellerAddress: ${
      listing.sellerAddress
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
async function validateListings({ contractsContext, fromBlock }) {
  const events = await listingCreatedEvents(
    contractsContext.marketplace,
    fromBlock
  )

  const netId = await contractsContext.web3.eth.net.getId()

  log.debug(`Found ${events.length} ListingCreated events`)

  for (const ev of events) {
    try {
      const valid = await verifyListingDBRecord(netId, ev)
      if (valid) {
        log.debug('Listing valid. :)')
      }
    } catch (err) {
      const errString = err.toString()
      if (errString.indexOf('Assertion') > -1) {
        log.error(
          `Unable to validate ${ev.event} event for transaction ${
            ev.transactionHash
          }`
        )
        log.error(errString)
      } else {
        throw err
      }
    }
  }
}

module.exports = {
  validateListings
}
