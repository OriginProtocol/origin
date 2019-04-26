const chai = require('chai')
const expect = chai.expect

const { GrowthEventTypes, GrowthEventStatuses } = require('../src/enums')
const { CampaignRules } = require('../src/resources/rules')


describe('Growth Engine rules', () => {

  before( () => {
    this.campaignStart = new Date()
    this.campaignEnd = new Date(this.campaignStart.getTime()+100000)
    this.duringCampaign = new Date(this.campaignStart.getTime()+100)
    this.beforeCampaign = new Date(this.campaignStart.getTime()-100000)
    this.afterCampaign = new Date(this.campaignEnd.getTime()+100)
  })

  describe('SingleEvent rule', () => {

    before( () => {
      const config = {
        numLevels: 1,
        levels: {
          0: {
            rules: [
              {
                id: 'PreRequisite',
                class: 'SingleEvent',
                config: {
                  eventType: GrowthEventTypes.ProfilePublished,
                  reward: {
                    amount: 1,
                    currency: 'OGN'
                  },
                  limit: 2,
                  nextLevelCondition: false,
                  visible: false,
                  scope: 'user'
                }
              }
            ],
          }
        }
      }
      const row = { id: 1 }
      this.crules = new CampaignRules(row, config)
      expect(this.crules).to.be.an('object')
      expect(this.crules.numLevels).to.equal(1)
      expect(this.crules.levels[0]).to.be.an('object')
      expect(this.crules.levels[0].rules.length).to.equal(1)

      this.ethAddress = '0x123'
    })

    it(`Should return level`, async () => {
      const events = [
        {
          id: 1,
          type: GrowthEventTypes.ProfilePublished,
          status: GrowthEventStatuses.Verified,
          ethAddress: this.ethAddress
        }
      ]
      this.crules.getEvents = () => {
        return events
      }
      const level = await this.crules.getCurrentLevel(this.ethAddress)
      expect(level).to.equal(0)
    })

    it(`Should return 1 reward`, async () => {
      const events = [
        {
          id: 1,
          type: GrowthEventTypes.ProfilePublished,
          status: GrowthEventStatuses.Verified,
          ethAddress: this.ethAddress
        }
      ]
      this.crules.getEvents = () => { return events }
      const level = await this.crules.getCurrentLevel(this.ethAddress)
      expect(level).to.equal(0)

      const rewards = await this.crules.getRewards(this.ethAddress)
      const expectedRewards = [{
          campaignId: 1,
          levelId: 0,
          ruleId: 'PreRequisite',
          value: {
            currency: 'OGN',
            amount: 1
          }
        }]
      expect(rewards).to.deep.equal(expectedRewards)
    })

    it(`Should return no reward if events are invalid`, async () => {
      const events = [
        {
          id: 1,
          type: GrowthEventTypes.ListingCreated,
          status: GrowthEventStatuses.Verified,
          ethAddress: this.ethAddress
        },
        {
          id: 2,
          type: GrowthEventTypes.ProfilePublished,
          status: GrowthEventStatuses.Fraud,
          ethAddress: this.ethAddress
        },
        {
          id: 3,
          type: GrowthEventTypes.ProfilePublished,
          status: GrowthEventStatuses.Verified,
          ethAddress: '0xbad'
        }
      ]
      this.crules.getEvents = () => { return events }

      const rewards = await this.crules.getRewards(this.ethAddress)
      const expectedRewards = []
      expect(rewards).to.deep.equal(expectedRewards)
    })

    it(`Should honor limit`, async () => {
      // 5 events but since limit is 2, only 2 rewards should be granted.
      const events = Array(5).fill({
        id: 1,
        type: GrowthEventTypes.ProfilePublished,
        status: GrowthEventStatuses.Verified,
        ethAddress: this.ethAddress
      })
      this.crules.getEvents = () => { return events }

      const rewards = await this.crules.getRewards(this.ethAddress)
      const expectedRewards = [
        {
          campaignId: 1,
          levelId: 0,
          ruleId: 'PreRequisite',
          value: {
            currency: 'OGN',
            amount: 1
          }
        },
        {
          campaignId: 1,
          levelId: 0,
          ruleId: 'PreRequisite',
          value: {
            currency: 'OGN',
            amount: 1
          }
        }
      ]
      expect(rewards).to.deep.equal(expectedRewards)
    })

  })

  describe('MultiEvents rule', () => {

    before( () => {
      const config = {
        numLevels: 1,
        levels: {
          0: {
            rules: [
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
                  numEventsRequired: 2,
                  reward: {
                    amount: 10,
                    currency: 'OGN'
                  },
                  limit: 1,
                  nextLevelCondition: false,
                  visible: false,
                  scope: 'user'
                }
              }
            ],
          }
        }
      }
      const row = { id: 1 }
      this.crules = new CampaignRules(row, config)
      expect(this.crules).to.be.an('object')
      expect(this.crules.numLevels).to.equal(1)
      expect(this.crules.levels[0]).to.be.an('object')
      expect(this.crules.levels[0].rules.length).to.equal(1)

      this.ethAddress = '0x123'
    })

    it(`Should return level`, async () => {
      const events = []
      this.crules.getEvents = () => {
        return events
      }
      const level = await this.crules.getCurrentLevel(this.ethAddress)
      expect(level).to.equal(0)
    })

    it(`Should return 1 reward`, async () => {
      const events = [
        {
          id: 1,
          type: GrowthEventTypes.TwitterAttestationPublished,
          status: GrowthEventStatuses.Verified,
          ethAddress: this.ethAddress
        },
        {
          id: 2,
          type: GrowthEventTypes.FacebookAttestationPublished,
          status: GrowthEventStatuses.Verified,
          ethAddress: this.ethAddress
        },
        {
          id: 3,
          type: GrowthEventTypes.AirbnbAttestationPublished,
          status: GrowthEventStatuses.Logged,
          ethAddress: this.ethAddress
        }
      ]
      this.crules.getEvents = () => { return events }

      const rewards = await this.crules.getRewards(this.ethAddress)
      const expectedRewards = [{
        campaignId: 1,
        levelId: 0,
        ruleId: 'TwoAttestations',
        value: {
          currency: 'OGN',
          amount: 10
        }
      }]
      expect(rewards).to.deep.equal(expectedRewards)
    })

    it(`Should return no reward when numRequired not met`, async () => {
      const events = [
        {
          id: 1,
          type: GrowthEventTypes.TwitterAttestationPublished,
          status: GrowthEventStatuses.Verified,
          ethAddress: this.ethAddress
        }
      ]
      this.crules.getEvents = () => { return events }

      const rewards = await this.crules.getRewards(this.ethAddress)
      const expectedRewards = []
      expect(rewards).to.deep.equal(expectedRewards)
    })

    it(`Should return no reward if events are invalid`, async () => {
      const events = [
        {
          id: 1,
          type: GrowthEventTypes.TwitterAttestationPublished,
          status: GrowthEventStatuses.Fraud,
          ethAddress: this.ethAddress
        },
        {
          id: 2,
          type: GrowthEventTypes.ProfilePublished,
          status: GrowthEventStatuses.Verified,
          ethAddress: this.ethAddress
        },
        {
          id: 3,
          type: GrowthEventTypes.AirbnbAttestationPublished,
          status: GrowthEventStatuses.Verified,
          ethAddress: '0xbad'
        }
      ]
      this.crules.getEvents = () => { return events }

      const rewards = await this.crules.getRewards(this.ethAddress)
      const expectedRewards = []
      expect(rewards).to.deep.equal(expectedRewards)
    })

    it(`Should honor limit`, async () => {
      // 2 event tuples meet rules requirement. But limit is 1 -> only 1 reward should be granted.
      const events = [
        {
          id: 1,
          type: GrowthEventTypes.TwitterAttestationPublished,
          status: GrowthEventStatuses.Verified,
          ethAddress: this.ethAddress
        },
        {
          id: 2,
          type: GrowthEventTypes.FacebookAttestationPublished,
          status: GrowthEventStatuses.Verified,
          ethAddress: this.ethAddress
        },
        {
          id: 3,
          type: GrowthEventTypes.AirbnbAttestationPublished,
          status: GrowthEventStatuses.Verified,
          ethAddress: this.ethAddress
        },
        {
          id: 4,
          type: GrowthEventTypes.PhoneAttestationPublished,
          status: GrowthEventStatuses.Verified,
          ethAddress: this.ethAddress
        },
      ]
      this.crules.getEvents = () => { return events }

      const rewards = await this.crules.getRewards(this.ethAddress)
      const expectedRewards = [{
        campaignId: 1,
        levelId: 0,
        ruleId: 'TwoAttestations',
        value: {
          currency: 'OGN',
          amount: 10
        }
      }]
      expect(rewards).to.deep.equal(expectedRewards)
    })
  })

  describe('Level calculation', () => {

    before(() => {
      const config = {
        numLevels: 2,
        levels: {
          0: {
            rules: [
              {
                id: 'PreRequisite',
                class: 'SingleEvent',
                config: {
                  eventType: GrowthEventTypes.ListingSold,
                  reward: null,
                  nextLevelCondition: true,
                  unlockConditionMsg: [
                    {
                      conditionTranslateKey: 'growth.profile.and.email.requirement',
                      conditionIcon: 'images/growth/email-icon-small.svg',
                    }
                  ],
                  visible: false,
                  scope: 'user'
                }
              }
            ],
          },
          1: {
            rules: [
              {
                id: 'ListingPurchase',
                class: 'SingleEvent',
                config: {
                  eventType: GrowthEventTypes.ListingPurchased,
                  reward: {
                    amount: 1,
                    currency: 'OGN'
                  },
                  limit: 10,
                  nextLevelCondition: false,
                  visible: false,
                  scope: 'campaign'
                }
              }
            ],
          }
        }
      }
      const row = {
        id: 1,
        rules: JSON.stringify(config),
        startDate: this.campaignStart,
        endDate: this.campaignEnd,
        currency: 'OGN'
      }
      this.crules = new CampaignRules(row, config)
      expect(this.crules).to.be.an('object')
      expect(this.crules.numLevels).to.equal(2)

      this.ethAddress = '0x123'

      const events = [
        {
          id: 1,
          type: GrowthEventTypes.ListingSold,
          status: GrowthEventStatuses.Verified,
          ethAddress: this.ethAddress,
          createdAt: this.beforeCampaign
        },
        {
          id: 2,
          type: GrowthEventTypes.ListingPurchased,
          status: GrowthEventStatuses.Verified,
          ethAddress: this.ethAddress,
          createdAt: this.beforeCampaign
        },
        {
          id: 3,
          type: GrowthEventTypes.ListingPurchased,
          status: GrowthEventStatuses.Verified,
          ethAddress: this.ethAddress,
          createdAt: this.duringCampaign
        },
        {
          id: 4,
          type: GrowthEventTypes.ListingPurchased,
          status: GrowthEventStatuses.Verified,
          ethAddress: this.ethAddress,
          createdAt: this.afterCampaign
        }
      ]
      // Mock getEvents.
      this.crules.getEvents = () => {
        return events
      }
    })

    it(`Should use events from inception to calculate level`, async () => {
      const level = await this.crules.getCurrentLevel(this.ethAddress)
      expect(level).to.equal(1)
    })

    it(`Should only use events from campaign period to calculate rewards`, async () => {
      const rewards = await this.crules.getRewards(this.ethAddress)
      const expectedRewards = [{
        campaignId: 1,
        levelId: 1,
        ruleId: 'ListingPurchase',
        value: {
          currency: 'OGN',
          amount: 1
        }
      }]
      expect(rewards).to.deep.equal(expectedRewards)
    })
  })
})