const logger = require('./logger')

const db = require('origin-growth/src/models')
const { GrowthEventStatuses } = require('origin-growth/src/enums')


/**
 * Insert an entry in the growth_event table after checking there
 * isn't a past entry of the same type.
 * @param {string} ethAddress
 * @param {GrwothEventTypes} eventType
 * @param {string} customId
 * @param {Object} data
 * @returns {Promise<void>}
 */
async function insertGrowthEvent(ethAddress, eventType, customId, data) {
  // Check there isn't't already an event of same type.
  const pastEvents = await db.GrowthEvent.findAll({
    where: {
      ethAddress: ethAddress.toLowerCase(),
      type: eventType
    }
  })
  if (pastEvents.length > 0) {
    logger.debug(`Skipped insert: found past growth event ${eventType} for account  ${ethAddress}`)
    return
  }

  // Record event.
  const eventData = {
    type: eventType,
    status: GrowthEventStatuses.Logged,
    ethAddress: ethAddress.toLowerCase(),
    data
  }
  await db.GrowthEvent.create(eventData)
  logger.debug(`Inserted growth event ${eventType} for account  ${ethAddress}`)
}

module.exports = { insertGrowthEvent }