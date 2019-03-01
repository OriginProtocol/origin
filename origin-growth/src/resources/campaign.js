const Sequelize = require('sequelize')

const db = require('../models')
const { CampaignRules } = require('./rules')

class GrowthCampaign {
  /**
   * Loads a campaign.
   * @param id
   * @returns {Promise<CampaignRules>}
   */
  static async get(id) {
    const campaign = await db.GrowthCampaign.findOne({ where: { id } })
    if (!campaign) {
      throw new Error(`No campaign with id ${id}`)
    }
    return new CampaignRules(campaign, JSON.parse(campaign.rules))
  }

  /**
   * Helper function that returns all past campaign rules.
   * @returns {Promise<Array<CampaignRules>>}
   */
  static async getPast() {
    const now = new Date()
    // Note: in the future we may target campaigns by user.
    // If that happens, add some filtering here by ethAddress.
    const campaigns = await db.GrowthCampaign.findAll({
      where: { endDate: { [Sequelize.Op.lt]: now } }
    })
    return campaigns.map(
      campaign => new CampaignRules(campaign, JSON.parse(campaign.rules))
    )
  }

  /**
   * Helper function that returns all campaign rules.
   * @returns {Promise<Array<CampaignRules>>}
   */
  static async getAll() {
    const campaigns = await db.GrowthCampaign.findAll({})
    return campaigns.map(
      campaign => new CampaignRules(campaign, JSON.parse(campaign.rules))
    )
  }
}

module.exports = { GrowthCampaign }
