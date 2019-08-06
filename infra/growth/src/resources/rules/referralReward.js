const { Reward } = require('./reward')

class ReferralReward extends Reward {
  constructor(campaignId, levelId, ruleId, value, referee) {
    super(campaignId, levelId, ruleId, value)
    this.refereeEthAddress = referee
  }
}

module.exports = { ReferralReward }
