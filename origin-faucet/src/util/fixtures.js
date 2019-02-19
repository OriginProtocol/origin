const db = require('./models')

async function createCampaign() {
  await db.FaucetCampaign.destroy({
    where: {},
    truncate: true
  })

  await db.FaucetCampaign.upsert({
    id: 1,
    name: 'Test campaign',
    inviteCode: 'test',
    startDate: Date.parse('January 1, 2019'),
    endDate: Date.parse('January 1, 2020'),
    budget: 1 * Math.pow(10, 18),
    amount: 1973,
    currency: 'ETH'
  })
}

createCampaign().then(() => {
  console.log('Done')
  process.exit()
})
