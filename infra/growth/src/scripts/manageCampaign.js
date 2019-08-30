// Script to create campaigns in production.
const db = require('../models')
const enums = require('../enums')
const { tokenToNaturalUnits } = require('../../src/util/token')

const aprilConfig = require('../../campaigns/april')
const mayConfig = require('../../campaigns/may')
const juneConfig = require('../../campaigns/june')
const julyConfig = require('../../campaigns/july')
const augustConfig = require('../../campaigns/august')
const septemberConfig = require('../../campaigns/september')

async function createAprilProdCampaign() {
  console.log('Creating April campaign data in prod...')

  /* IMPORTANT when adding new translatable fields update the enums document:
   * origin-dapp/src/constants/Growth$FbtEnum.js
   */
  await db.GrowthCampaign.create({
    nameKey: 'growth.apr2019.name',
    shortNameKey: 'growth.apr2019.short_name',
    rules: JSON.stringify(aprilConfig),
    startDate: Date.parse('March 18, 2019, 00:00 UTC'),
    endDate: Date.parse('May 1, 2019, 00:00 UTC'),
    distributionDate: Date.parse('May 1, 2019, 00:00 UTC'),
    cap: tokenToNaturalUnits(1000000), // Set cap to 1M tokens
    capUsed: 0,
    currency: 'OGN',
    rewardStatus: enums.GrowthCampaignRewardStatuses.NotReady
  })
}

async function createMayProdCampaign() {
  console.log('Creating May campaign data in prod...')

  /* IMPORTANT when adding new translatable fields update the enums document:
   * origin-dapp/src/constants/Growth$FbtEnum.js
   */
  await db.GrowthCampaign.create({
    nameKey: 'growth.may2019.name',
    shortNameKey: 'growth.may2019.short_name',
    rules: JSON.stringify(mayConfig),
    startDate: Date.parse('May 1, 2019, 00:00 UTC'),
    endDate: Date.parse('June 1, 2019, 00:00 UTC'),
    distributionDate: Date.parse('June 1, 2019, 00:00 UTC'),
    cap: tokenToNaturalUnits(1000000), // Set cap to 1M tokens
    capUsed: 0,
    currency: 'OGN',
    rewardStatus: enums.GrowthCampaignRewardStatuses.NotReady
  })
}

async function updateMayProdRules() {
  console.log('Updating May campaign rules in prod...')

  const campaign = await db.GrowthCampaign.findOne({ where: { id: 3 } })
  await campaign.update({ rules: JSON.stringify(mayConfig) })
}

async function createJuneProdCampaign() {
  console.log('Creating June campaign data in prod...')

  /* IMPORTANT when adding new translatable fields update the enums document:
   * origin-dapp/src/constants/Growth$FbtEnum.js
   */
  await db.GrowthCampaign.create({
    nameKey: 'growth.june2019.name',
    shortNameKey: 'growth.june2019.short_name',
    rules: JSON.stringify(juneConfig),
    startDate: Date.parse('June 1, 2019, 00:00 UTC'),
    endDate: Date.parse('July 1, 2019, 00:00 UTC'),
    distributionDate: Date.parse('July 1, 2019, 00:00 UTC'),
    cap: tokenToNaturalUnits(1000000), // Set cap to 1M tokens
    capUsed: 0,
    currency: 'OGN',
    rewardStatus: enums.GrowthCampaignRewardStatuses.NotReady
  })
}

async function updateJuneProdRules() {
  console.log('Updating June campaign rules in prod...')

  const campaign = await db.GrowthCampaign.findOne({ where: { id: 4 } })
  await campaign.update({ rules: JSON.stringify(juneConfig) })
}

async function createJulyProdCampaign() {
  console.log('Creating July campaign data in prod...')

  /* IMPORTANT when adding new translatable fields update the enums document:
   * origin-dapp/src/constants/Growth$FbtEnum.js
   */
  await db.GrowthCampaign.create({
    nameKey: 'growth.july2019.name',
    shortNameKey: 'growth.july2019.short_name',
    rules: JSON.stringify(julyConfig),
    startDate: Date.parse('July 1, 2019, 00:00 UTC'),
    endDate: Date.parse('August 1, 2019, 00:00 UTC'),
    distributionDate: Date.parse('August 1, 2019, 00:00 UTC'),
    cap: tokenToNaturalUnits(1000000), // Set cap to 1M tokens
    capUsed: 0,
    currency: 'OGN',
    rewardStatus: enums.GrowthCampaignRewardStatuses.NotReady
  })
}

async function updateJulyProdRules() {
  console.log('Updating August campaign rules in prod...')

  const campaign = await db.GrowthCampaign.findOne({ where: { id: 5 } })
  await campaign.update({ rules: JSON.stringify(julyConfig) })
}

async function createAugProdCampaign() {
  console.log('Creating August campaign data in prod...')

  /* IMPORTANT when adding new translatable fields update the enums document:
   * origin-dapp/src/constants/Growth$FbtEnum.js
   */
  await db.GrowthCampaign.create({
    nameKey: 'growth.aug2019.name',
    shortNameKey: 'growth.aug2019.short_name',
    rules: JSON.stringify(augustConfig),
    startDate: Date.parse('August 1, 2019, 00:00 UTC'),
    endDate: Date.parse('September 1, 2019, 00:00 UTC'),
    distributionDate: Date.parse('September 1, 2019, 00:00 UTC'),
    cap: tokenToNaturalUnits(1000000), // Set cap to 1M tokens
    capUsed: 0,
    currency: 'OGN',
    rewardStatus: enums.GrowthCampaignRewardStatuses.NotReady
  })
}

async function updateAugProdRules() {
  console.log('Updating June campaign rules in prod...')

  const campaign = await db.GrowthCampaign.findOne({ where: { id: 6 } })
  await campaign.update({ rules: JSON.stringify(augustConfig) })
}

async function createSepProdCampaign() {
  console.log('Creating September campaign data in prod...')

  /* IMPORTANT when adding new translatable fields update the enums document:
   * origin-dapp/src/constants/Growth$FbtEnum.js
   */
  await db.GrowthCampaign.create({
    nameKey: 'growth.sep2019.name',
    shortNameKey: 'growth.sep.short_name',
    rules: JSON.stringify(septemberConfig),
    startDate: Date.parse('September 1, 2019, 00:00 UTC'),
    endDate: Date.parse('October 1, 2019, 00:00 UTC'),
    distributionDate: Date.parse('October 1, 2019, 00:00 UTC'),
    cap: tokenToNaturalUnits(1000000), // Set cap to 1M tokens
    capUsed: 0,
    currency: 'OGN',
    rewardStatus: enums.GrowthCampaignRewardStatuses.NotReady
  })
}

async function updateSepProdRules() {
  console.log('Updating September campaign rules in prod...')

  const campaign = await db.GrowthCampaign.findOne({ where: { id: 7 } })
  await campaign.update({ rules: JSON.stringify(septemberConfig) })
}

const args = {}
process.argv.forEach(arg => {
  const t = arg.split('=')
  const argVal = t.length > 1 ? t[1] : true
  args[t[0]] = argVal
})

const createByMonth = {
  april: createAprilProdCampaign,
  may: createMayProdCampaign,
  june: createJuneProdCampaign,
  july: createJulyProdCampaign,
  august: createAugProdCampaign,
  september: createSepProdCampaign
}

const updateByMonth = {
  may: updateMayProdRules,
  june: updateJuneProdRules,
  july: updateJulyProdRules,
  august: updateAugProdRules,
  september: updateSepProdRules
}

const action = args['--action']
if (!action) {
  console.err('Missing --action argument')
  process.exit()
}

const month = args['--month']
if (!month) {
  console.err('Missing --month argument')
  process.exit()
}

let fn
if (action === 'create') {
  fn = createByMonth[month]
} else if (action === 'update') {
  fn = updateByMonth[month]
} else {
  console.err(`Unexpected action ${action}`)
  process.exit()
}

if (!fn) {
  console.err(`No create function for month of ${month}`)
  process.exit()
}

fn().then(() => {
  console.log('Done')
  process.exit()
})
