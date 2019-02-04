const db = require('../models')
const { GrowthEventStatuses, GrowthEventTypes } = require('../enums')

const AttestationTopicToEventType = {
  'airbnb': GrowthEventTypes.AirbnbAttestationPublished,
  'email': GrowthEventTypes.EmailAttestationPublished,
  'facebook': GrowthEventTypes.FacebookAttestationPublished,
  'phone': GrowthEventTypes.PhoneAttestationPublished,
  'twitter': GrowthEventTypes.TwitterAttestationPublished
}

class GrowthEvent {

  /**
   * Insert an entry in the growth_event DB table after checking there
   * isn't a past entry of the same type.
   * @param {string} ethAddress
   * @param {GrowthEventTypes} eventType
   * @param {string} customId - Optional custom id. For ex can hold listing or offer Id.
   * @param {Object} data - Optional data to record along with the event.
   * @returns {Promise<void>}
   */
   static async insert(logger, ethAddress, eventType, customId, data) {
    // Check there isn't already an event of the same type.
    const where = {
      ethAddress: ethAddress.toLowerCase(),
      type: eventType
    }
    if (customId) {
      where.customId = customId
    }
    const pastEvents = await db.GrowthEvent.findAll({ where })
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
}

module.exports = { AttestationTopicToEventType, GrowthEvent }