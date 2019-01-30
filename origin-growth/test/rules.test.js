const chai = require('chai')
const expect = chai.expect

const { GrowthEventTypes, GrowthEventStatuses } = require('../src/enums')
const { Campaign } = require('../src/rules/rules')


describe('Growth Engine rules', () => {

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
                  upgradeCondition: false
                }
              }
            ],
          }
        }
      }
      const row = { id: 1 }
      this.campaign = new Campaign(row, config)
      expect(this.campaign).to.be.an('object')
      expect(this.campaign.numLevels).to.equal(1)
      expect(this.campaign.levels[0]).to.be.an('object')
      expect(this.campaign.levels[0].rules.length).to.equal(1)

      this.ethAddress = '0x123'
    })

    it(`Should return level`, () => {
      const events = [
        {
          id: 1,
          type: GrowthEventTypes.ProfilePublished,
          status: GrowthEventStatuses.Verified,
          ethAddress: this.ethAddress
        }
      ]
      this.campaign.getEvents = () => {
        return events
      }
      const level = this.campaign.getCurrentLevel(this.ethAddress)
      expect(level).to.equal(0)
    })

    it(`Should return 1 reward`, () => {
      const events = [
        {
          id: 1,
          type: GrowthEventTypes.ProfilePublished,
          status: GrowthEventStatuses.Verified,
          ethAddress: this.ethAddress
        }
      ]
      this.campaign.getEvents = () => { return events }
      const level = this.campaign.getCurrentLevel(this.ethAddress)
      expect(level).to.equal(0)

      const rewards = this.campaign.getRewards(this.ethAddress)
      const expectedRewards = {
        0: {
          'PreRequisite': [
            {
              campaignId: 1,
              levelId: 0,
              ruleId: 'PreRequisite',
              money: {
                currency: 'OGN',
                amount: 1
              }
            }
          ]
        }
      }
      expect(rewards).to.deep.equal(expectedRewards)
    })

    it(`Should return no reward if events are invalid`, () => {
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
      this.campaign.getEvents = () => { return events }

      const rewards = this.campaign.getRewards(this.ethAddress)
      const expectedRewards = {
        0: {
          'PreRequisite': []
        }
      }
      expect(rewards).to.deep.equal(expectedRewards)
    })

    it(`Should honor limit`, () => {
      // 5 events but since limit is 2, only 2 rewards should be granted.
      const events = Array(5).fill({
        id: 1,
        type: GrowthEventTypes.ProfilePublished,
        status: GrowthEventStatuses.Verified,
        ethAddress: this.ethAddress
      })
      this.campaign.getEvents = () => { return events }

      const rewards = this.campaign.getRewards(this.ethAddress)
      const expectedRewards = {
        0: {
          'PreRequisite': [
            {
              campaignId: 1,
              levelId: 0,
              ruleId: 'PreRequisite',
              money: {
                currency: 'OGN',
                amount: 1
              }
            },
            {
              campaignId: 1,
              levelId: 0,
              ruleId: 'PreRequisite',
              money: {
                currency: 'OGN',
                amount: 1
              }
            }
          ]
        }
      }
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
                    'EmailAttestationPublished',
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
                  upgradeCondition: true
                }
              }
            ],
          }
        }
      }
      const row = { id: 1 }
      this.campaign = new Campaign(row, config)
      expect(this.campaign).to.be.an('object')
      expect(this.campaign.numLevels).to.equal(1)
      expect(this.campaign.levels[0]).to.be.an('object')
      expect(this.campaign.levels[0].rules.length).to.equal(1)

      this.ethAddress = '0x123'
    })

    it(`Should return level`, () => {
      const events = []
      this.campaign.getEvents = () => {
        return events
      }
      const level = this.campaign.getCurrentLevel(this.ethAddress)
      expect(level).to.equal(0)
    })

    it(`Should return 1 reward`, () => {
      const events = [
        {
          id: 1,
          type: GrowthEventTypes.EmailAttestationPublished,
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
      this.campaign.getEvents = () => { return events }

      const rewards = this.campaign.getRewards(this.ethAddress)
      const expectedRewards = {
        0: {
          'TwoAttestations': [
            {
              campaignId: 1,
              levelId: 0,
              ruleId: 'TwoAttestations',
              money: {
                currency: 'OGN',
                amount: 10
              }
            }
          ]
        }
      }
      expect(rewards).to.deep.equal(expectedRewards)
    })

    it(`Should return no reward when numRequired not met`, () => {
      const events = [
        {
          id: 1,
          type: GrowthEventTypes.EmailAttestationPublished,
          status: GrowthEventStatuses.Verified,
          ethAddress: this.ethAddress
        }
      ]
      this.campaign.getEvents = () => { return events }

      const rewards = this.campaign.getRewards(this.ethAddress)
      const expectedRewards = {
        0: {
          'TwoAttestations': []
        }
      }
      expect(rewards).to.deep.equal(expectedRewards)
    })

    it(`Should return no reward if events are invalid`, () => {
      const events = [
        {
          id: 1,
          type: GrowthEventTypes.EmailAttestationPublished,
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
      this.campaign.getEvents = () => { return events }

      const rewards = this.campaign.getRewards(this.ethAddress)
      const expectedRewards = {
        0: {
          'TwoAttestations': []
        }
      }
      expect(rewards).to.deep.equal(expectedRewards)
    })

    it(`Should honor limit`, () => {
      // 2 event tuples meet rules requirement. But limit is 1 -> only 1 reward should be granted.
      const events = [
        {
          id: 1,
          type: GrowthEventTypes.EmailAttestationPublished,
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
      this.campaign.getEvents = () => { return events }

      const rewards = this.campaign.getRewards(this.ethAddress)
      const expectedRewards = {
        0: {
          'TwoAttestations': [
            {
              campaignId: 1,
              levelId: 0,
              ruleId: 'TwoAttestations',
              money: {
                currency: 'OGN',
                amount: 10
              }
            }
          ]
        }
      }
      expect(rewards).to.deep.equal(expectedRewards)
    })
  })
})