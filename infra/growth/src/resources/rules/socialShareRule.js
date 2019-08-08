const Sequelize = require('sequelize')

const { SingleEventRule } = require('./singleEventRule')
const { Reward } = require('./reward')
const logger = require('../../logger')
const _discoveryModels = require('@origin/discovery/src/models')
const _identityModels = require('@origin/identity/src/models')
const db = { ..._discoveryModels, ..._identityModels }
const { tokenToNaturalUnits } = require('../../util/token')

/**
 * A rule that rewards for sharing content on social networks
 */
class SocialShareRule extends SingleEventRule {
  constructor(crules, levelId, config) {
    super(crules, levelId, config)
    if (!this.config.socialNetwork) {
      throw new Error(`${this.str()}: missing socialNetwork field`)
    }
    if (!['twitter', 'facebook'].includes(this.config.socialNetwork)) {
      throw new Error(
        `${this.str()}: unexpected value ${
          this.config.socialNetwork
        } for socialNetwork field`
      )
    }
    this.socialNetwork = this.config.socialNetwork

    if (!this.config.content) {
      throw new Error(`${this.str()}: missing content field`)
    }
    this.content = this.config.content
  }

  /**
   * Calculates the personalized reward amount based on number of followers
   * and age of the user's twitter account.
   *
   * @param {Object} twitterProfile: see list of fields here:
   *        https://developer.twitter.com/en/docs/accounts-and-users/manage-account-settings/api-reference/get-account-verify_credentials
   * @returns {<number>} Calculated amount. Returns 0 if the profile is invalid.
   * @private
   */
  _calcTwitterReward(twitterProfile) {
    // Validate the profile.
    if (
      twitterProfile.verified === undefined ||
      twitterProfile.created_at === undefined ||
      twitterProfile.followers_count === undefined
    ) {
      logger.error('Invalid twitterProfile. Returning zero reward.')
      return 0
    }

    // Constants for the formula
    const minAccountAgeDays = 365
    const minAgeLastTweetDays = 365
    const minFollowersThreshold = 10
    const tierFollowersThreshold = 100
    const tierFollowersIncrement = 200
    const verifiedMultiplier = 2

    // Extract stats of interest from the profile data.
    const verified = twitterProfile.verified
    const createdAt = new Date(twitterProfile.created_at)
    const numFollowers = twitterProfile.followers_count
    const lastTweetDate = twitterProfile.status
      ? new Date(twitterProfile.status.created_at)
      : new Date()

    // Calculate age of the account and of the last tweet in days.
    const now = new Date()
    const accountAgeDays = Math.ceil(
      Math.abs(now.getTime() - createdAt.getTime()) / (24 * 60 * 60 * 1000)
    )
    const lastTweetAgeDate = Math.ceil(
      Math.abs(now.getTime() - lastTweetDate.getTime()) / (24 * 60 * 60 * 1000)
    )

    // Check account and last tweet minimum age requirements.
    if (
      accountAgeDays < minAccountAgeDays ||
      lastTweetAgeDate > minAgeLastTweetDays
    ) {
      return 0
    }

    // Apply formula to compute reward.
    if (numFollowers < minFollowersThreshold) return 0
    if (numFollowers < tierFollowersThreshold) return tokenToNaturalUnits(1)
    const amount = Math.floor(numFollowers / tierFollowersIncrement) + 1
    return tokenToNaturalUnits(verified ? amount * verifiedMultiplier : amount)
  }

  /**
   * Calculate personalized amount the user should get if they complete the sharing action.
   * @param {string} ethAddress
   * @param {Object} identityForTest - For testing only.
   * @returns {Promise<Reward>}
   */
  async getReward(ethAddress, identityForTest = null) {
    // Create a reward object with amount set to zero.
    const reward = new Reward(this.campaignId, this.levelId, this.id, {
      amount: '0',
      currency: this.config.reward.currency
    })
    if (!ethAddress) {
      // No user passed. Return zero.
      return reward
    }

    // Load any proxy associated with the wallet address.
    const ownerAddress = ethAddress.toLowerCase()
    const proxies = await db.Proxy.findAll({ where: { ownerAddress } })

    // Query events from wallet and proxy(ies).
    const addresses = [ownerAddress, ...proxies.map(proxy => proxy.address)]
    const whereClause = { ethAddress: { [Sequelize.Op.in]: addresses } }

    if (this.socialNetwork === 'facebook') {
      return this.reward
    } else if (this.socialNetwork === 'twitter') {
      // Return a personalized amount calculated based on social network stats stored in the user's identity.
      const identity =
        (await db.Identity.findOne({
          where: whereClause,
          order: [['createdAt', 'DESC']]
        })) || identityForTest
      if (!identity) {
        logger.error(`No identity found for ${ethAddress}`)
        return reward
      }
      if (!identity.data || !identity.data.twitterProfile) {
        logger.error(`Missing twitterProfile in identity of user ${ethAddress}`)
        return reward
      }
      // TODO: handle other social networks.
      reward.value.amount = this._calcTwitterReward(
        identity.data.twitterProfile
      ).toString()
    }

    return reward
  }

  /**
   * Calculate the personalized Twitter reward amount for each SocialShare event.
   * @param {string} ethAddress
   * @param {Array<db.GrowthEvent>} events
   * @returns {Array<Reward>}
   * @private
   */
  _getTwitterRewardsEarned(ethAddress, events) {
    // For each event, get the user's Twitter stats from the GrowthEvent row
    // then calculate the amount.
    const rewards = []
    for (const event of events) {
      if (!event.data || !event.data.twitterProfile) {
        throw new Error(
          `GrowthEvent ${event.id}: missing or invalid twitter profile`
        )
      }
      const amount = this._calcTwitterReward(
        event.data.twitterProfile
      ).toString()
      const reward = new Reward(this.campaignId, this.levelId, this.id, {
        amount,
        currency: this.config.reward.currency
      })
      rewards.push(reward)
    }
    return rewards
  }

  /**
   * Compute a personalized reward amount earned based on the user's social stats.
   *
   * @param ethAddress
   * @param events
   * @returns {Promise<Array<Reward>>}
   */
  async getEarnedRewards(ethAddress, events) {
    const inScopeEvents = this._inScope(events)
    const numRewards = await this._numRewards(ethAddress, inScopeEvents)
    let eventsForCalculation = events
      .filter(event => event.type === this.config.eventType)
      .slice(0, numRewards)

    if (this.config.socialNetwork === 'facebook') {
      eventsForCalculation = eventsForCalculation.filter(
        event => event.customId === this.content.id
      )
    }

    let rewards = super.getEarnedRewards(ethAddress, eventsForCalculation)
    if (this.config.socialNetwork === 'twitter') {
      rewards = this._getTwitterRewardsEarned(ethAddress, eventsForCalculation)
    }
    return rewards
  }

  customIdFilter(customId) {
    if (this.config.socialNetwork === 'facebook') {
      return customId === this.content.id
    }
    return true
  }
}

module.exports = { SocialShareRule }
