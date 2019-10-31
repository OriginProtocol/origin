// Insert data in the DB for testing purposes.
const db = require('../models')
const enums = require('../enums')

// Accounts generated using Truffle default mnemonic:
// "candy maple cake sugar pudding cream honey rich smooth crumble sweet treat"
// Token supplier. Account 1.
// const account1 = '0x627306090abaB3A6e1400e9345bC60c78a8BEf57'.toLowerCase()

// User. Account 2.
//const account2 = '0xf17f52151EbEF6C7334FAD080c5704D77216b732'.toLowerCase()

const aprilConfig = require('../../campaigns/april.js')
const mayConfig = require('../../campaigns/may.js')
const juneConfig = require('../../campaigns/june.js')
const julyConfig = require('../../campaigns/july.js')
const augustConfig = require('../../campaigns/august.js')
const septemberConfig = require('../../campaigns/september.js')
const octoberConfig = require('../../campaigns/october.js')
const novemberConfig = require('../../campaigns/november.js')

async function createTestData() {
  //
  // Campaigns
  //
  console.log('Creating test campaign data...')

  await db.GrowthCampaign.destroy({
    where: {},
    truncate: true
  })

  /* IMPORTANT when adding new translatable fields update the enums document:
   * origin-dapp/src/constants/Growth$FbtEnum.js
   */

  await db.GrowthCampaign.upsert({
    id: 1,
    nameKey: 'growth.jan2019.name',
    shortNameKey: 'growth.jan2019.short_name',
    rules: JSON.stringify(aprilConfig),
    startDate: Date.parse('January 1, 2019'),
    endDate: Date.parse('February 1, 2019'),
    distributionDate: Date.parse('February 1, 2019'),
    cap: 10000 * Math.pow(10, 18),
    capUsed: 0,
    currency: 'OGN',
    rewardStatus: enums.GrowthCampaignRewardStatuses.NotReady
  })

  await db.GrowthCampaign.upsert({
    id: 2,
    nameKey: 'growth.feb2019.name',
    shortNameKey: 'growth.feb2019.short_name',
    rules: JSON.stringify(aprilConfig),
    startDate: Date.parse('February 1, 2019'),
    endDate: Date.parse('March 1, 2019'),
    distributionDate: Date.parse('March 1, 2019'),
    cap: 10000 * Math.pow(10, 18),
    capUsed: 0,
    currency: 'OGN',
    rewardStatus: enums.GrowthCampaignRewardStatuses.NotReady
  })

  await db.GrowthCampaign.upsert({
    id: 3,
    nameKey: 'growth.mar2019.name',
    shortNameKey: 'growth.mar2019.short_name',
    rules: JSON.stringify(aprilConfig),
    startDate: Date.parse('March 1, 2019'),
    endDate: Date.parse('Apr 1, 2019'),
    distributionDate: Date.parse('April 1, 2019'),
    cap: 10000 * Math.pow(10, 18),
    capUsed: 0,
    currency: 'OGN',
    rewardStatus: enums.GrowthCampaignRewardStatuses.NotReady
  })

  await db.GrowthCampaign.upsert({
    id: 4,
    nameKey: 'growth.apr2019.name',
    shortNameKey: 'growth.apr2019.short_name',
    rules: JSON.stringify(aprilConfig),
    startDate: Date.parse('April 1, 2019'),
    endDate: Date.parse('April 28, 2019'),
    distributionDate: Date.parse('May 1, 2019'),
    cap: 10000 * Math.pow(10, 18),
    capUsed: 0,
    currency: 'OGN',
    rewardStatus: enums.GrowthCampaignRewardStatuses.NotReady
  })

  await db.GrowthCampaign.upsert({
    id: 5,
    nameKey: 'growth.may2019.name',
    shortNameKey: 'growth.may2019.short_name',
    rules: JSON.stringify(mayConfig),
    startDate: Date.parse('April 28, 2019'),
    endDate: Date.parse('June 1, 2019'),
    distributionDate: Date.parse('June 1, 2019'),
    cap: 10000 * Math.pow(10, 18),
    capUsed: 0,
    currency: 'OGN',
    rewardStatus: enums.GrowthCampaignRewardStatuses.NotReady
  })

  await db.GrowthCampaign.upsert({
    id: 6,
    nameKey: 'growth.june2019.name',
    shortNameKey: 'growth.june2019.short_name',
    rules: JSON.stringify(juneConfig),
    startDate: Date.parse('May 31, 2019'),
    endDate: Date.parse('July 1, 2019'),
    distributionDate: Date.parse('July 1, 2019'),
    cap: 10000 * Math.pow(10, 18),
    capUsed: 0,
    currency: 'OGN',
    rewardStatus: enums.GrowthCampaignRewardStatuses.NotReady
  })

  await db.GrowthCampaign.upsert({
    id: 7,
    nameKey: 'growth.july2019.name',
    shortNameKey: 'growth.july2019.short_name',
    rules: JSON.stringify(julyConfig),
    startDate: Date.parse('June 30, 2019'),
    endDate: Date.parse('August 1, 2019'),
    distributionDate: Date.parse('August 1, 2019'),
    cap: 10000 * Math.pow(10, 18),
    capUsed: 0,
    currency: 'OGN',
    rewardStatus: enums.GrowthCampaignRewardStatuses.NotReady
  })

  await db.GrowthCampaign.upsert({
    id: 8,
    nameKey: 'growth.aug2019.name',
    shortNameKey: 'growth.aug2019.short_name',
    rules: JSON.stringify(augustConfig),
    startDate: Date.parse('July 31, 2019'),
    endDate: Date.parse('September 1, 2019'),
    distributionDate: Date.parse('September 1, 2019'),
    cap: 10000 * Math.pow(10, 18),
    capUsed: 0,
    currency: 'OGN',
    rewardStatus: enums.GrowthCampaignRewardStatuses.NotReady
  })

  await db.GrowthCampaign.upsert({
    id: 9,
    nameKey: 'growth.sep2019.name',
    shortNameKey: 'growth.sep2019.short_name',
    rules: JSON.stringify(septemberConfig),
    startDate: Date.parse('September 1, 2019'),
    endDate: Date.parse('October 1, 2019'),
    distributionDate: Date.parse('October 1, 2019'),
    cap: 10000 * Math.pow(10, 18),
    capUsed: 0,
    currency: 'OGN',
    rewardStatus: enums.GrowthCampaignRewardStatuses.NotReady
  })

  await db.GrowthCampaign.upsert({
    id: 10,
    nameKey: 'growth.oct2019.name',
    shortNameKey: 'growth.oct2019.short_name',
    rules: JSON.stringify(octoberConfig),
    startDate: Date.parse('October 1, 2019'),
    endDate: Date.parse('November 1, 2019'),
    distributionDate: Date.parse('November 1, 2019'),
    cap: 10000 * Math.pow(10, 18),
    capUsed: 0,
    currency: 'OGN',
    rewardStatus: enums.GrowthCampaignRewardStatuses.NotReady
  })

  await db.GrowthCampaign.upsert({
    id: 11,
    nameKey: 'growth.nov2019.name',
    shortNameKey: 'growth.nov2019.short_name',
    rules: JSON.stringify(novemberConfig),
    startDate: Date.parse('November 1, 2019'), // TODO CHANGE THIS
    endDate: Date.parse('December 1, 2019'),
    distributionDate: Date.parse('December 1, 2019'),
    cap: 10000 * Math.pow(10, 18),
    capUsed: 0,
    currency: 'OGN',
    rewardStatus: enums.GrowthCampaignRewardStatuses.NotReady
  })
  //
  // Participants
  //
  // console.log('Creating test participant data...')

  // await db.GrowthParticipant.destroy({
  //   where: {},
  //   truncate: true
  // })

  // await db.GrowthParticipant.upsert({
  //   ethAddress: account2,
  //   status: enums.GrowthParticipantStatuses.Active,
  //   data: null,
  //   agreementId: 'Test agreement'
  // })
  // await db.GrowthParticipant.update(
  //   { createdAt: Date.parse('January 1, 2019') },
  //   { where: { ethAddress: account2 } }
  // )

  // await db.GrowthParticipant.upsert({
  //   ethAddress: account2,
  //   status: enums.GrowthParticipantStatuses.Active,
  //   data: null,
  //   agreementId: 'Test agreement'
  // })
  // await db.GrowthParticipant.update(
  //   { createdAt: Date.parse('January 1, 2019') },
  //   { where: { ethAddress: account2 } }
  // )

  //
  // Events
  //
  // console.log('Creating test event data...')

  // await db.GrowthEvent.destroy({
  //   where: {},
  //   truncate: true
  // })

  // await db.GrowthEvent.upsert({
  //   id: 1,
  //   customId: null,
  //   type: enums.GrowthEventTypes.ProfilePublished,
  //   status: enums.GrowthEventStatuses.Logged,
  //   ethAddress: account2,
  //   data: null
  // })
  // await db.GrowthEvent.update(
  //   { createdAt: Date.parse('January 2, 2019') },
  //   { where: { id: 1 } }
  // )

  // await db.GrowthEvent.upsert({
  //   id: 2,
  //   customId: null,
  //   type: enums.GrowthEventTypes.EmailAttestationPublished,
  //   status: enums.GrowthEventStatuses.Logged,
  //   ethAddress: account2,
  //   data: null
  // })
  // await db.GrowthEvent.update(
  //   { createdAt: Date.parse('January 2, 2019') },
  //   { where: { id: 2 } }
  // )

  // await db.GrowthEvent.upsert({
  //   id: 3,
  //   customId: null,
  //   type: enums.GrowthEventTypes.AirbnbAttestationPublished,
  //   status: enums.GrowthEventStatuses.Logged,
  //   ethAddress: account2,
  //   data: null
  // })
  // await db.GrowthEvent.update(
  //   { createdAt: Date.parse('January 3, 2019') },
  //   { where: { id: 3 } }
  // )

  // await db.GrowthEvent.upsert({
  //   id: 4,
  //   customId: null,
  //   type: enums.GrowthEventTypes.TwitterAttestationPublished,
  //   status: enums.GrowthEventStatuses.Logged,
  //   ethAddress: account2,
  //   data: null
  // })
  // await db.GrowthEvent.update(
  //   { createdAt: Date.parse('January 3, 2019') },
  //   { where: { id: 4 } }
  // )

  // await db.GrowthEvent.upsert({
  //   id: 5,
  //   customId: null,
  //   type: enums.GrowthEventTypes.RefereeSignedUp,
  //   status: enums.GrowthEventStatuses.Logged,
  //   ethAddress: account2,
  //   data: null
  // })
  // await db.GrowthEvent.update(
  //   { createdAt: Date.parse('January 4, 2019') },
  //   { where: { id: 5 } }
  // )

  // await db.GrowthEvent.upsert({
  //   id: 6,
  //   customId: '1-000-456',
  //   type: enums.GrowthEventTypes.ListingCreated,
  //   status: enums.GrowthEventStatuses.Logged,
  //   ethAddress: account2,
  //   data: null
  // })
  // await db.GrowthEvent.update(
  //   { createdAt: Date.parse('January 5, 2019') },
  //   { where: { id: 6 } }
  // )

  // await db.GrowthEvent.upsert({
  //   id: 7,
  //   customId: '1-000-789-1',
  //   type: enums.GrowthEventTypes.ListingPurchased,
  //   status: enums.GrowthEventStatuses.Logged,
  //   ethAddress: account2,
  //   data: null
  // })
  // await db.GrowthEvent.update(
  //   { createdAt: Date.parse('January 6, 2019') },
  //   { where: { id: 7 } }
  // )

  // // Wipe out any previous rewards.
  // await db.GrowthReward.destroy({
  //   where: {},
  //   truncate: true
  // })
}

createTestData().then(() => {
  console.log('Done')
  process.exit()
})
