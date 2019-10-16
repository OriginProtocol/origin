const Sequelize = require('sequelize')

const db = require('../models')
const { CampaignRules } = require('./rules')
const enums = require('../enums')

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
   * Fetches the active campaign
   * @returns {Promise<CampaignRules>}
   */
  static async getActive() {
    const now = new Date()
    const campaign = await db.GrowthCampaign.findOne({
      where: {
        startDate: {
          [Sequelize.Op.lte]: now
        },
        endDate: {
          [Sequelize.Op.gt]: now
        }
      }
    })

    if (!campaign) {
      return null
    }

    return new CampaignRules(campaign, JSON.parse(campaign.rules))
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
