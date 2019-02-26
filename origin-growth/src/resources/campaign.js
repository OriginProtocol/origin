const Sequelize = require('sequelize')

const db = require('../models')

class GrowthCampaign {
  // Return all the past campaigns a user participated to.
  static async getPast() {
    const now = new Date()
    // Note: in the future we may target campaigns by user.
    // If that happens, add some filtering here by ethAddress.
    return await db.GrowthCampaign.findAll({
      where: { endDate: { [Sequelize.Op.lt]: now } }
    })
  }
}

module.exports = { GrowthCampaign }
