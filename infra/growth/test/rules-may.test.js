const BigNumber = require('bignumber.js')
const chai = require('chai')
const expect = chai.expect

const { GrowthEventTypes, GrowthEventStatuses } = require('../src/enums')
const { CampaignRules } = require('../src/resources/rules')

function tokenNaturalUnits(x) {
  return BigNumber(x)
    .times(BigNumber(10).pow(18))
    .toFixed()
}

describe('May campaign rules', () => {

  before(() => {
    const config = {
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
                  visible: true,
                  scope: 'campaign'
                }
              },
              {
                id: 'EmailAttestation',
                class: 'SingleEvent',
                config: {
                  eventType: 'EmailAttestationPublished',
                  reward: null,
                  visible: true,
                  nextLevelCondition: false,
                  scope: 'campaign'
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
                  scope: 'user',
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
                  nextLevelCondition: false,
                  scope: 'campaign'
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
                  nextLevelCondition: false,
                  scope: 'campaign'
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
                  nextLevelCondition: false,
                  scope: 'campaign'
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
                  nextLevelCondition: false,
                  scope: 'campaign'
                }
              },
              {
                id: 'GoogleAttestation',
                class: 'SingleEvent',
                config: {
                  eventType: 'GoogleAttestationPublished',
                  reward: {
                    amount: tokenNaturalUnits(25),
                    currency: 'OGN'
                  },
                  visible: true,
                  limit: 1,
                  nextLevelCondition: false,
                  scope: 'campaign'
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
                    'TwitterAttestationPublished',
                    'GoogleAttestationPublished'
                  ],
                  visible: false,
                  numEventsRequired: 2,
                  reward: null,
                  nextLevelCondition: true,
                  scope: 'user',
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
                  nextLevelCondition: false,
                  scope: 'campaign'
                }
              },
              {
                id: 'ListingPurchaseTShirt',
                class: 'ListingPurchase',
                config: {
                  eventType: 'ListingPurchased',
                  listingId: '1-000-1',
                  reward: {
                    amount: tokenNaturalUnits(25),
                    currency: 'OGN'
                  },
                  visible: true,
                  limit: 100,
                  nextLevelCondition: false,
                  scope: 'campaign'
                }
              },
              {
                id: 'ListingPurchaseGC',
                class: 'ListingPurchase',
                config: {
                  listingId: '1-000-2',
                  reward: {
                    amount: tokenNaturalUnits(50),
                    currency: 'OGN'
                  },
                  visible: true,
                  limit: 100,
                  nextLevelCondition: false,
                  scope: 'campaign'
                }
              },
              {
                id: 'ListingPurchaseDonation',
                class: 'ListingPurchase',
                config: {
                  listingId: '1-000-3',
                  reward: {
                    amount: tokenNaturalUnits(500),
                    currency: 'OGN'
                  },
                  visible: true,
                  limit: 100,
                  nextLevelCondition: false,
                  scope: 'campaign'
                }
              },
              {
                id: 'ListingPurchaseHousing',
                class: 'ListingPurchase',
                config: {
                  listingId: '1-000-4',
                  reward: {
                    amount: tokenNaturalUnits(100),
                    currency: 'OGN'
                  },
                  visible: true,
                  limit: 100,
                  nextLevelCondition: false,
                  scope: 'campaign'
                }
              },
              {
                id: 'ListingPurchaseInfluencer',
                class: 'ListingPurchase',
                config: {
                  listingId: '1-000-5',
                  reward: {
                    amount: tokenNaturalUnits(100),
                    currency: 'OGN'
                  },
                  visible: true,
                  limit: 100,
                  nextLevelCondition: false,
                  scope: 'campaign'
                }
              },
              {
                id: 'ListingPurchaseArt',
                class: 'ListingPurchase',
                config: {
                  listingId: '1-000-6',
                  reward: {
                    amount: tokenNaturalUnits(1000),
                    currency: 'OGN'
                  },
                  visible: true,
                  limit: 100,
                  nextLevelCondition: false,
                  scope: 'campaign'
                }
              }
            ]
          }
        }
      }
    this.campaignStart = new Date()
    this.campaignEnd = new Date(this.campaignStart.getTime()+100000)
    this.duringCampaign = new Date(this.campaignStart.getTime()+100)
    this.beforeCampaign = new Date(this.campaignStart.getTime()-100000)
    this.afterCampaign = new Date(this.campaignEnd.getTime()+100)

    const row = {
      id: 1,
      rules: JSON.stringify(config),
      startDate: this.campaignStart,
      endDate: this.campaignEnd,
      currency: 'OGN'
    }
    this.crules = new CampaignRules(row, config)
    expect(this.crules).to.be.an('object')
    expect(this.crules.numLevels).to.equal(3)
    expect(this.crules.levels[0]).to.be.an('object')
    expect(this.crules.levels[0].rules.length).to.equal(3)
    expect(this.crules.levels[1]).to.be.an('object')
    expect(this.crules.levels[1].rules.length).to.equal(6)
    expect(this.crules.levels[2]).to.be.an('object')
    expect(this.crules.levels[2].rules.length).to.equal(7)

    this.ethAddress = '0x123'
    this.referee = '0x456'
    this.expectedRewards = []

    // Mock the _getReferees method of the Referral rule.
    this.crules.levels[2].rules[0]._getReferees = () => { return [] }
  })

  it(`Should start at level 0`, async () => {
    const events = []
    this.crules.getEvents = () => {
      return events
    }
    const level = await this.crules.getCurrentLevel(this.ethAddress)
    expect(level).to.equal(0)
  })

  it(`Should graduate to level 1`, async () => {
    this.events = [
      {
        id: 1,
        type: GrowthEventTypes.ProfilePublished,
        status: GrowthEventStatuses.Logged,
        ethAddress: this.ethAddress,
        createdAt: this.duringCampaign
      },
      {
        id: 2,
        type: GrowthEventTypes.EmailAttestationPublished,
        status: GrowthEventStatuses.Logged,
        ethAddress: this.ethAddress,
        createdAt: this.duringCampaign
      }
    ]
    this.crules.getEvents = () => {
      return this.events
    }

    const rewards = await this.crules.getRewards(this.ethAddress)
    expect(rewards).to.deep.equal([])

    const level = await this.crules.getCurrentLevel(this.ethAddress)
    expect(level).to.equal(1)
  })

  it(`Should graduate to level 2`, async () => {
    this.events.push(
      {
        id: 3,
        type: GrowthEventTypes.TwitterAttestationPublished,
        status: GrowthEventStatuses.Logged,
        ethAddress: this.ethAddress,
        createdAt: this.duringCampaign
      },
      {
        id: 4,
        type: GrowthEventTypes.GoogleAttestationPublished,
        status: GrowthEventStatuses.Logged,
        ethAddress: this.ethAddress,
        createdAt: this.duringCampaign
      }
    )
    this.crules.getEvents = () => { return this.events }

    const rewards = await this.crules.getRewards(this.ethAddress)
    this.expectedRewards.push(
      {
        campaignId: 1,
        levelId: 1,
        ruleId: 'TwitterAttestation',
        value: {
          currency: 'OGN',
          amount: tokenNaturalUnits(25)
        },
      },
      {
        campaignId: 1,
        levelId: 1,
        ruleId: 'GoogleAttestation',
        value: {
          currency: 'OGN',
          amount: tokenNaturalUnits(25)
        }
      }
    )
    expect(rewards).to.deep.equal(this.expectedRewards)

    const level = await this.crules.getCurrentLevel(this.ethAddress)
    expect(level).to.equal(2)
  })

  it(`Should remain on level 2 when a referee signs up`, async () => {
    this.crules.levels[2].rules[0]._getReferees = () => { return [this.referee] }
    this.crules.getPriorLevel = () => { return 0 }
    this.events.push(
      {
        id: 7,
        type: GrowthEventTypes.ProfilePublished,
        status: GrowthEventStatuses.Logged,
        ethAddress: this.referee,
        createdAt: this.duringCampaign
      },
      {
        id: 8,
        type: GrowthEventTypes.EmailAttestationPublished,
        status: GrowthEventStatuses.Logged,
        ethAddress: this.referee,
        createdAt: this.duringCampaign
      },
      {
        id: 9,
        type: GrowthEventTypes.TwitterAttestationPublished,
        status: GrowthEventStatuses.Logged,
        ethAddress: this.referee,
        createdAt: this.duringCampaign
      },
      {
        id: 10,
        type: GrowthEventTypes.PhoneAttestationPublished,
        status: GrowthEventStatuses.Logged,
        ethAddress: this.referee,
        createdAt: this.duringCampaign
      }
    )
    this.crules.getEvents = () => { return this.events }

    const rewards = await this.crules.getRewards(this.ethAddress)
    this.expectedRewards.push({
      campaignId: 1,
      levelId: 2,
      ruleId: 'Referral',
      value: {
        currency: 'OGN',
        amount: tokenNaturalUnits(50)
      },
      refereeEthAddress: this.referee
    })
    expect(rewards).to.deep.equal(this.expectedRewards)

    const level = await this.crules.getCurrentLevel(this.ethAddress)
    expect(level).to.equal(2)
  })

  it(`Should remain on level 2 when a listing is purchased`, async () => {
    this.events.push(
      {
        id: 11,
        type: GrowthEventTypes.ListingPurchased,
        customId: '1-000-1',
        status: GrowthEventStatuses.Logged,
        ethAddress: this.ethAddress,
        createdAt: this.duringCampaign
      }
    )
    this.crules.getEvents = () => { return this.events }

    const rewards = await this.crules.getRewards(this.ethAddress)
    this.expectedRewards.push({
      campaignId: 1,
      levelId: 2,
      ruleId: 'ListingPurchaseTShirt',
      value: {
        currency: 'OGN',
        amount: tokenNaturalUnits(25)
      }
    })
    expect(rewards).to.deep.equal(this.expectedRewards)

    const level = await this.crules.getCurrentLevel(this.ethAddress)
    expect(level).to.equal(2)
  })

})
