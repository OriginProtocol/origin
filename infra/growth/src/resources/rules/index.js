const Sequelize = require('sequelize')

const _growthModels = require('../../models')
const _discoveryModels = require('@origin/discovery/src/models')
const _identityModels = require('@origin/identity/src/models')
const db = { ..._growthModels, ..._discoveryModels, ..._identityModels }
const { Level } = require('./level')

const { GrowthEventStatuses, GrowthCampaignStatuses } = require('../../enums')

class CampaignRules {
  constructor(campaign, config) {
    this.campaign = campaign
    this.config = config

    if (
      !this.config.numLevels ||
      !Number.isInteger(this.config.numLevels) ||
      this.config.numLevels <= 0
    ) {
      throw new Error(
        `Campaign ${campaign.id}: invalid or missing numLevels field.`
      )
    }
    this.numLevels = this.config.numLevels

    this.allRules = [] // Flat list of rules.
    this.content = this.config.content
    this.levels = {}
    for (let i = 0; i < this.config.numLevels; i++) {
      if (!this.config.levels[i]) {
        throw new Error(`Campaign ${this.campaign.id}: missing level ${i}`)
      }
      this.levels[i] = new Level(this, i, this.config.levels[i])
    }
  }

  /**
   * Returns the value of the referral reward, if any, defined in the campaign
   * @returns {{amount: string, currency: string}||null}
   */
  getReferralRewardValue() {
    // Go thru each rule and check if it is of type Referral.
    for (let i = 0; i < this.config.numLevels; i++) {
      for (const rule of this.levels[i].rules) {
        if (rule.constructor.name === 'ReferralRule') {
          return rule.rewardValue
        }
      }
    }
    return null
  }

  /**
   * Reads events related to a user from the DB.
   * Events recorded from any of the proxies owned by that wallet are included.
   *
   * @param {string} ethAddress - User's wallet address..
   * @param {Object} Options:
   *   - duringCampaign - Restricts query to events that occurred during
   *  the campaign. By default all events since user signed up are returned.
   *   - beforeCampaign - Restricts query to events that occurred prior to the
   *   campaign start. By default all events since user signed up are returned.
   *   - onlyVerified - Only returns events with status Verified.
   *   By default returns events with status Verified or Logged.
   * @returns {Promise<Array<models.GrowthEvent>>}
   */
  async getEvents(ethAddress, opts = {}) {
    if (opts.beforeCampaign && opts.duringCampaign) {
      throw new Error('beforeCampaign and duringCampaign args are incompatible')
    }

    // Load any proxy associated with the wallet address.
    const ownerAddress = ethAddress.toLowerCase()
    const proxies = await db.Proxy.findAll({ where: { ownerAddress } })

    // Query events from wallet and proxy(ies).
    const addresses = [ownerAddress, ...proxies.map(proxy => proxy.address)]
    const whereClause = { ethAddress: { [Sequelize.Op.in]: addresses } }

    const endDate = opts.beforeCampaign
      ? this.campaign.startDate
      : this.campaign.capReachedDate || this.campaign.endDate
    if (opts.duringCampaign) {
      whereClause.createdAt = {
        [Sequelize.Op.gte]: this.campaign.startDate,
        [Sequelize.Op.lt]: endDate
      }
    } else {
      whereClause.createdAt = {
        [Sequelize.Op.lt]: endDate
      }
    }

    if (opts.onlyVerified) {
      whereClause.status = GrowthEventStatuses.Verified
    } else {
      whereClause.status = {
        [Sequelize.Op.in]: [
          GrowthEventStatuses.Logged,
          GrowthEventStatuses.Verified
        ]
      }
    }

    const events = await db.GrowthEvent.findAll({
      where: whereClause,
      order: [['id', 'ASC']]
    })
    return events
  }

  /**
   * Helper method to calculate level based on a set of events.
   * @param {string} ethAddress
   * @param {Array<models.GrowthEvent>} events
   * @returns {number}
   * @private
   */
  async _calculateLevel(ethAddress, events) {
    let level
    for (level = 0; level < this.config.numLevels - 1; level++) {
      const qualify = await this.levels[level].qualifyForNextLevel(
        ethAddress,
        events
      )
      if (!qualify) {
        break
      }
    }
    return level
  }

  /**
   * Returns the user level.
   *
   * @param {string} ethAddress - User's account.
   * @param {boolean} onlyVerifiedEvents - If true, only uses events with
   *  status Verified for the calculation. By default uses events with
   *  status Verified or Logged.
   * @returns {Promise<number>}
   */
  async getCurrentLevel(ethAddress, onlyVerifiedEvents = false) {
    const events = await this.getEvents(ethAddress, { onlyVerifiedEvents })
    return await this._calculateLevel(ethAddress, events)
  }

  /**
   * Returns the user level prior to the campaign starting.
   *
   * @param ethAddress
   * @returns {Promise<number>}
   */
  async getPriorLevel(ethAddress) {
    const events = await this.getEvents(ethAddress, { beforeCampaign: true })
    return await this._calculateLevel(ethAddress, events)
  }

  /**
   * Calculates rewards earned by the user.
   *
   * @param {string} ethAddress - User's account.
   * @param {boolean} onlyVerifiedEvents - Only use events with status Verified
   *   for the calculation. By default uses events with status Verified or Logged.
   * @returns {Promise<Array<Reward>>} - List of rewards, in no specific order.
   */
  async getEarnedRewards(ethAddress, onlyVerifiedEvents = false) {
    const rewards = []
    const events = await this.getEvents(ethAddress, { onlyVerifiedEvents })
    const currentLevel = await this.getCurrentLevel(
      ethAddress,
      onlyVerifiedEvents
    )
    for (let i = 0; i <= currentLevel; i++) {
      const levelRewards = await this.levels[i].getEarnedRewards(
        ethAddress,
        events
      )
      rewards.push(...levelRewards)
    }
    return rewards
  }

  /**
   * Returns campaign status.
   *
   * @returns {Enum<GrowthCampaignStatuses>} - campaign status
   */
  getStatus() {
    const now = new Date()
    if (this.campaign.startDate > now) {
      return GrowthCampaignStatuses.Pending
    } else if (this.campaign.startDate < now && this.campaign.endDate > now) {
      //TODO: check if cap reached
      return GrowthCampaignStatuses.Active
    } else if (this.campaign.endDate < now) {
      return GrowthCampaignStatuses.Completed
    }
    throw new Error(`Unexpected status for campaign id:${this.campaign.id}`)
  }

  /**
   * Exports the state of the rules for a given user.
   * Walks thru all the rules and calls the adapter with data for each rule.
   *
   * @param {Adapter} adapter - Class to use for formatting the rule data.
   * @param {string} ethAddress - if this parameter is null or undefined growth returns the rules
   *                              without any user specific data
   * @returns {Promise<Array<Object>>} List representing state of each rule.
   */
  async export(adapter, ethAddress) {
    const events = ethAddress ? await this.getEvents(ethAddress) : undefined
    const level = ethAddress
      ? await this._calculateLevel(ethAddress, events)
      : undefined

    const data = []
    for (let i = 0; i < this.numLevels; i++) {
      data.push(
        ...(await this.levels[i].export(adapter, ethAddress, events, level))
      )
    }
    return data
  }
}

module.exports = { CampaignRules }
