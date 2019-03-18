// Script to create campaign in production.

const BigNumber = require('bignumber.js')

const db = require('../models')
const enums = require('../enums')

function tokenNaturalUnits(x) {
  return BigNumber(x)
    .times(BigNumber(10).pow(18))
    .toFixed()
}

const marchRules = {
  numLevels: 3,
  levels: {
    0: {
      rules: [
        {
          id: 'ProfilePublished',
          class: 'SingleEvent',
          config: {
            eventType: 'ProfilePublished',
            reward: null,
            nextLevelCondition: false,
            visible: true
          }
        },
        {
          id: 'EmailAttestation',
          class: 'SingleEvent',
          config: {
            eventType: 'EmailAttestationPublished',
            reward: null,
            visible: true,
            limit: 1,
            nextLevelCondition: false
          }
        },
        {
          id: 'BothRules',
          class: 'MultiEvents',
          config: {
            eventTypes: ['ProfilePublished', 'EmailAttestationPublished'],
            visible: false,
            numEventsRequired: 2,
            reward: null,
            nextLevelCondition: true,
            unlockConditionMsg: [
              {
                conditionTranslateKey: 'growth.profile.requirement',
                conditionIcon: 'images/growth/email-icon-small.svg'
              },
              {
                conditionTranslateKey: 'growth.email.requirement',
                conditionIcon: 'images/growth/email-icon-small.svg'
              }
            ]
          }
        }
      ]
    },
    1: {
      rules: [
        {
          id: 'PhoneAttestation',
          class: 'SingleEvent',
          config: {
            eventType: 'PhoneAttestationPublished',
            reward: {
              amount: tokenNaturalUnits(25),
              currency: 'OGN'
            },
            visible: true,
            limit: 1,
            nextLevelCondition: false
          }
        },
        {
          id: 'FacebookAttestation',
          class: 'SingleEvent',
          config: {
            eventType: 'FacebookAttestationPublished',
            reward: {
              amount: tokenNaturalUnits(25),
              currency: 'OGN'
            },
            visible: true,
            limit: 1,
            nextLevelCondition: false
          }
        },
        {
          id: 'AirbnbAttestation',
          class: 'SingleEvent',
          config: {
            eventType: 'AirbnbAttestationPublished',
            reward: {
              amount: tokenNaturalUnits(25),
              currency: 'OGN'
            },
            visible: true,
            limit: 1,
            nextLevelCondition: false
          }
        },
        {
          id: 'TwitterAttestation',
          class: 'SingleEvent',
          config: {
            eventType: 'TwitterAttestationPublished',
            reward: {
              amount: tokenNaturalUnits(25),
              currency: 'OGN'
            },
            visible: true,
            limit: 1,
            nextLevelCondition: false
          }
        },
        {
          id: 'TwoAttestations',
          class: 'MultiEvents',
          config: {
            eventTypes: [
              'PhoneAttestationPublished',
              'FacebookAttestationPublished',
              'AirbnbAttestationPublished',
              'TwitterAttestationPublished'
            ],
            visible: false,
            numEventsRequired: 2,
            reward: null,
            nextLevelCondition: true,
            unlockConditionMsg: [
              {
                conditionTranslateKey: 'growth.two.attestations.requirement',
                conditionIcon: 'images/growth/attestation-icon.svg'
              }
            ]
          }
        }
      ]
    },
    2: {
      rules: [
        {
          id: 'Referral',
          class: 'Referral',
          config: {
            levelRequired: 2,
            reward: {
              amount: tokenNaturalUnits(50),
              currency: 'OGN'
            },
            limit: 25,
            visible: true,
            nextLevelCondition: false
          }
        },
        {
          id: 'ListingSold',
          class: 'SingleEvent',
          config: {
            eventType: 'ListingSold',
            reward: {
              amount: tokenNaturalUnits(100),
              currency: 'OGN'
            },
            visible: true,
            limit: 1,
            nextLevelCondition: false
          }
        },
        {
          id: 'ListingPurchase',
          class: 'SingleEvent',
          config: {
            eventType: 'ListingPurchased',
            reward: {
              amount: tokenNaturalUnits(100),
              currency: 'OGN'
            },
            visible: true,
            limit: 1,
            nextLevelCondition: false
          }
        }
      ]
    }
  }
}

async function createProdMarchCampaign() {
  console.log('Creating March campaign data in prod...')

  /* IMPORTANT when adding new translatable fields update the enums document:
   * origin-dapp/src/constants/Growth$FbtEnum.js
   */
  await db.GrowthCampaign.create({
    nameKey: 'growth.apr2019.name',
    shortNameKey: 'growth.apr2019.short_name',
    rules: JSON.stringify(marchRules),
    startDate: Date.parse('March 18, 2019, 00:00 UTC'),
    endDate: Date.parse('Apr 31, 2019, 00:00 UTC'),
    distributionDate: Date.parse('May 1, 2019, 00:00 UTC'),
    cap: 1000000 * Math.pow(10, 18), // Cap is 1M tokens
    capUsed: 0,
    currency: 'OGN',
    rewardStatus: enums.GrowthCampaignRewardStatuses.Active
  })
}

createProdMarchCampaign().then(() => {
  console.log('Done')
  process.exit()
})
