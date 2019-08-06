const Sequelize = require('sequelize')
const { ReferralReward } = require('./referralReward')
const logger = require('../../logger')
const { BaseRule } = require('./baseRule')
const db = require('../../models')

/**
 * A rule for rewarding a referrer when their referees reaches a certain level.
 *
 * Note: For the referrer to obtain the reward during a given campaign,
 * the referee must reached the required level during that campaign's window.
 */
class ReferralRule extends BaseRule {
  constructor(crules, levelId, config) {
    super(crules, levelId, config)

    // Level the referee is required to reach for the referrer to get the reward.
    if (!this.config.levelRequired) {
      throw new Error(`${this.str()}: missing levelRequired field`)
    }
    this.levelRequired = this.config.levelRequired
  }

  /**
   * Return true if the referrer qualifies for at least one referral reward
   * as part of the campaign.
   * Note: this could become configurable if needed in the future. For example
   * to require N rewards.
   * @param {string} ethAddress - Referrer's account.
   * @returns {boolean}
   */
  async _evaluate(ethAddress) {
    return (await this.getEarnedRewards(ethAddress).length) > 0
  }

  /**
   * Returns list of address of referees for a referrer.
   * @param {string} referrer - Referrer's eth address.
   * @returns {Promise<Array<string>>}
   * @private
   */
  async _getReferees(referrer) {
    const invites = await db.GrowthReferral.findAll({
      where: {
        referrerEthAddress: referrer,
        createdAt: { [Sequelize.Op.lte]: this.campaign.endDate }
      }
    })
    return invites.map(i => i.refereeEthAddress)
  }

  /**
   * Calculates referral rewards:
   *  - load list of referee's of the referrer
   *  - for each referee, check they are at required level and that level
   *  was reaching during this campaign.
   * @param {string} ethAddress - Referrer's account.
   * @returns {Array<ReferralReward>}
   */
  async getEarnedRewards(ethAddress) {
    // If this rule does not give out reward, return right away.
    if (!this.reward) {
      return []
    }

    let rewards = []

    // Go thru each referee and check if they meet the referral reward conditions.
    const referees = await this._getReferees(ethAddress)
    for (const referee of referees) {
      // Check the referee is at or above required level.
      const refereeLevel = await this.crules.getCurrentLevel(referee)

      if (refereeLevel < this.levelRequired) {
        logger.debug(
          `Referee ${referee} does not meet level requirement. skipping.`
        )
        continue
      }

      if (this.config.scope === 'campaign') {
        // Check the referee reached the level during this campaign as opposed
        // to prior to the campaign.
        const refereePriorLevel = await this.crules.getPriorLevel(referee)
        if (refereePriorLevel >= this.levelRequired) {
          logger.debug(
            `Referee ${referee} reached level prior to campaign start. skipping`
          )
          continue
        }
      }

      // Referral is valid. Referrer should get a reward for it.
      logger.debug(
        `Referrer ${ethAddress} gets credit for referring ${referee}`
      )
      const reward = new ReferralReward(
        this.campaignId,
        this.levelId,
        this.id,
        this.rewardValue,
        referee
      )
      rewards.push(reward)
    }

    // Enforce rules limit.
    rewards = rewards.slice(0, this.limit)

    return rewards
  }

  async _numRewards(ethAddress) {
    return (await this.getEarnedRewards(ethAddress)).length
  }
}

module.exports = { ReferralRule }