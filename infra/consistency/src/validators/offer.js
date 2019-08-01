/**
 * Validates offers by making sure OfferCreated creates DB records, and does
 * cursory checking of the data.
 *
 * TODO: Add support for other events. (e.g. OfferAccepted, OfferFinalized, etc)
 */
const esmImport = require('esm')(module)
const db = {
  ...esmImport('@origin/discovery/src/models')
}

const { log } = require('../logger')
const { assert, getListenerBlock, getPastEvents } = require('./utils')

async function offerCreatedEvents(contract, fromBlock, toBlock) {
  if (!toBlock || toBlock === 'latest') {
    toBlock = await getListenerBlock('main', 'Marketplace_')
  }
  return await getPastEvents(contract, 'OfferCreated', {
    fromBlock,
    toBlock
  })
}

/**
 * Verify that the DB records are sane on a cursory level
 *
 * @param netId {number} The Ethereum network ID we're checking
 * @param event {object} The event object from getPastEvents()
 * @returns {bool} whether or not it was validated
 * @throws {Error} describing the assertion error (offer invalid)
 */
async function verifyOfferDBRecord(netId, event) {
  const listingId = event.returnValues.listingID
  const offerId = event.returnValues.offerID
  const fqListingID = `${netId}-000-${listingId}`
  const fqOfferID = `${fqListingID}-${offerId}`

  const records = await db.Offer.findAll({
    where: {
      id: fqOfferID
    }
  })

  // Make sure we have the expected amount of records
  assert(
    records.length > 0,
    `Did not find a matching record for offer #${fqOfferID}`
  )
  assert(records.length < 2, `Found too many records for offer #${fqOfferID}`)

  const offer = records[0]

  assert(
    offer.listingId === fqListingID,
    `Invalid listing ID.  ${offer.listingId} !== ${listingId}`
  )

  assert(
    offer.buyerAddress === event.returnValues.party.toLowerCase(),
    `Unexpected buyer.  ${offer.buyerAddress} !== ${event.returnValues.party}`
  )

  return true
}

/**
 * Verify that offer DB records have been created for every OfferCreated event
 *
 * @param args {object} map of function arguments
 */
async function validateOffers({ contractsContext, fromBlock }) {
  const events = await offerCreatedEvents(
    contractsContext.marketplace,
    fromBlock
  )

  const netId = await contractsContext.web3.eth.net.getId()

  log.debug(`Found ${events.length} OfferCreated events`)

  for (const ev of events) {
    try {
      const valid = await verifyOfferDBRecord(netId, ev)
      if (valid) {
        log.debug('Offer valid. :)')
      }
    } catch (err) {
      if (err.name === 'AssertionError') {
        log.error(
          `Unable to validate ${ev.event} event for offer #${netId}-000-${ev.returnValues.listingID}-${ev.returnValues.offerID} transaction ${ev.transactionHash}`
        )
        log.error(err.toString())
      } else {
        throw err
      }
    }
  }
}

module.exports = {
  validateOffers
}
