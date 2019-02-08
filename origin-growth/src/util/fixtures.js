const db = require('../models')

// For testing purposes

db.GrowthCampaign.destroy({
  where: {},
  truncate: true
})

db.GrowthCampaign.upsert({
  id: 1,
  name: 'FEB 2019',
  rules: JSON.stringify({}),
  startDate: Date.parse('February 1, 2019'),
  endDate: Date.parse('February 28, 2019'),
  distributionDate: Date.parse('March 28, 2019'),
  cap: 10000 * Math.pow(10, 18),
  capUsed: 2000 * Math.pow(10, 18),
  currency: 'OGN'
})

db.GrowthCampaign.upsert({
  id: 2,
  name: 'MAR 2019',
  rules: JSON.stringify({}),
  startDate: Date.parse('March 1, 2019'),
  endDate: Date.parse('March 31, 2019'),
  distributionDate: Date.parse('April 28, 2019'),
  cap: 10000 * Math.pow(10, 18),
  capUsed: 2000 * Math.pow(10, 18),
  currency: 'OGN'
})

db.GrowthCampaign.upsert({
  id: 3,
  name: 'APR 2019',
  rules: JSON.stringify({}),
  startDate: Date.parse('April 1, 2019'),
  endDate: Date.parse('April 30, 2019'),
  distributionDate: Date.parse('May 28, 2019'),
  cap: 10000 * Math.pow(10, 18),
  capUsed: 2000 * Math.pow(10, 18),
  currency: 'OGN'
})
