const Web3 = require('web3')
const db = require('../models')
const { GrowthEventStatuses, GrowthEventTypes } = require('../enums')

const AttestationServiceToEventType = {
  airbnb: GrowthEventTypes.AirbnbAttestationPublished,
  email: GrowthEventTypes.EmailAttestationPublished,
  facebook: GrowthEventTypes.FacebookAttestationPublished,
  phone: GrowthEventTypes.PhoneAttestationPublished,
  twitter: GrowthEventTypes.TwitterAttestationPublished
}

class GrowthEvent {
  static async _findAll(ethAddress, eventType, customId) {
    const where = {
      ethAddress: ethAddress.toLowerCase(),
      type: eventType
    }
    if (customId) {
      where.customId = customId
    }
    return db.GrowthEvent.findAll({ where })
  }

  /**
   * Insert an entry in the growth_event DB table after checking there
   * isn't a past entry of the same type.
   * @param {Object} logger
   * @param {string} ethAddress
   * @param {GrowthEventTypes} eventType
   * @param {string} customId - Optional custom id. For ex can hold listing or offer Id.
   * @param {Object} data - Optional data to record along with the event.
   * @returns {Promise<void>}
   */
  static async insert(logger, ethAddress, eventType, customId, data) {
    // Check input.
    if (!Web3.utils.isAddress(ethAddress)) {
      throw new Error(`Invalid eth address ${ethAddress}`)
    }

    // Check there isn't already an event of the same type.
    const pastEvents = await GrowthEvent._findAll(
      ethAddress,
      eventType,
      customId
    )
    if (pastEvents.length > 0) {
      logger.debug(
        `Skipped insert: found past growth event ${eventType} for account  ${ethAddress}`
      )
      return
    }

    // Record event.
    const eventData = {
      ethAddress: ethAddress.toLowerCase(),
      type: eventType,
      status: GrowthEventStatuses.Logged,
      customId,
      data
    }
    await db.GrowthEvent.create(eventData)
    logger.debug(
      `Inserted growth event ${eventType} for account  ${ethAddress}`
    )
  }

  /**
   * Returns all events matching the specified criteria.
   * @param {Object} logger
   * @param {string} ethAddress
   * @param {GrowthEventTypes} eventType
   * @param {string} customId - Optional custom id. For ex can hold listing or offer Id.
   * @returns {Promise<Array<Object>>}
   */
  static async findAll(logger, ethAddress, eventType, customId) {
    return GrowthEvent._findAll(ethAddress, eventType, customId)
  }
}

module.exports = { AttestationServiceToEventType, GrowthEvent }
