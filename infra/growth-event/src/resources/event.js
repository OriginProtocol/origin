const Web3 = require('web3')
const db = require('../models')
const { GrowthEventStatuses, GrowthEventTypes } = require('../enums')

const AttestationServiceToEventType = {
  airbnb: GrowthEventTypes.AirbnbAttestationPublished,
  email: GrowthEventTypes.EmailAttestationPublished,
  facebook: GrowthEventTypes.FacebookAttestationPublished,
  phone: GrowthEventTypes.PhoneAttestationPublished,
  twitter: GrowthEventTypes.TwitterAttestationPublished,
  google: GrowthEventTypes.GoogleAttestationPublished,
  github: GrowthEventTypes.GitHubAttestationPublished,
  linkedin: GrowthEventTypes.LinkedInAttestationPublished,
  kakao: GrowthEventTypes.KakaoAttestationPublished,
  wechat: GrowthEventTypes.WeChatAttestationPublished,
  website: GrowthEventTypes.WebsiteAttestationPublished
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
   * Insert N entries in the growth_event DB table after checking there
   * isn't already N past entries of the same type.
   * @param {Object} logger
   * @param {integer} num - Number of entries to insert.
   * @param {string} ethAddress
   * @param {GrowthEventTypes} eventType
   * @param {string} customId - Optional custom id. For ex can hold listing or offer Id.
   * @param {Object} data - Optional data to record along with the event.
   * @param {Date} createdAt - Creation time.
   * @returns {Promise<void>}
   */
  static async insert(
    logger,
    num,
    ethAddress,
    eventType,
    customId,
    data,
    createdAt
  ) {
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
    const numToInsert = num - pastEvents.length
    if (numToInsert <= 0) {
      logger.info(
        `Skipped insert: found ${pastEvents.length} past growth event ${eventType} for account ${ethAddress}`
      )
      return
    }

    // Record events.
    const eventData = {
      ethAddress: ethAddress.toLowerCase(),
      type: eventType,
      status: GrowthEventStatuses.Logged,
      customId,
      data,
      createdAt
    }
    for (let i = 0; i < numToInsert; i++) {
      await db.GrowthEvent.create(eventData)
    }
    logger.info(
      `Inserted ${numToInsert} growth event ${eventType} for account ${ethAddress}`
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
