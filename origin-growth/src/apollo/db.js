const db = require('../models')

function _makeCampaign(row) {
  let status
  const endDate = new Date(row.endDate) / 1000
  const startDate = new Date(row.startDate) / 1000
  const currentDate = Date.now() / 1000
  const capReached = row.capUsed > row.cap

  if (currentDate > startDate && currentDate < endDate) {
    status = capReached ? 'capReached' : 'active'
  } else if (currentDate < startDate) status = 'pending'
  else if (currentDate > endDate) status = 'completed'

  return {
    id: row.id,
    name: row.name,
    startDate: startDate,
    endDate: endDate,
    distributionDate: row.distributionDate,
    status: status,
    actions: [], // TODO implement
    rewardEarned: { currency: 'OGN', amount: 0 } // TODO implement
  }
}

async function getCampaigns() {
  const rows = await db.GrowthCampaign.findAll({
    order: [['id', 'DESC']]
  })

  return rows.map(row => _makeCampaign(row))
}

module.exports = {
  getCampaigns
}
