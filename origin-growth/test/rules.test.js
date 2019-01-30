const chai = require('chai')
const expect = chai.expect

const { GrowthEventTypes, GrowthEventStatuses } = require('../src/enums')
const { Campaign } = require('../src/rules/rules')


describe('Growth Engine rules', () => {
  describe('SingleEvent rule', () => {
    it(`Should create a campaign with SingleEvent rule`, () => {
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
                  limit: 1,
                  upgradeCondition: false
                }
              }
            ],
          }
        }
      }
      const row = { id: 1 }
      const campaign = new Campaign(row, config)
      expect(campaign).to.be.an('object')
      expect(campaign.numLevels).to.equal(1)
      expect(campaign.levels[0]).to.be.an('object')
      expect(campaign.levels[0].rules.length).to.equal(1)

      const ethAddress = '0x123'
      const events = [
        {
          id: 1,
          type: GrowthEventTypes.ProfilePublished,
          status: GrowthEventStatuses.Verified,
          ethAddress: ethAddress
        }
      ]
      campaign.getEvents = () => { return events }
      const level = campaign.getCurrentLevel(ethAddress)
      expect(level).to.equal(0)

      const rewards = campaign.getRewards(ethAddress)
      expect(rewards).to.be.an('object')
      expect(rewards['0']['PreRequisite'][0].campaignId).to.equal(1)
      expect(rewards['0']['PreRequisite'][0].levelId).to.equal(0)
      expect(rewards['0']['PreRequisite'][0].ruleId).to.equal('PreRequisite')
      expect(rewards['0']['PreRequisite'][0].money.amount).to.equal(1)
      expect(rewards['0']['PreRequisite'][0].money.currency).to.equal('OGN')
    })
  })

  describe('MultiEvents rule', () => {
    it(`Should create a campaign with a MultiEvents rule`, () => {
      const config = {
        numLevels: 1,
        levels: {
          0: {
            rules: [
              {
                id: 'PreRequisite',
                class: 'MultiEvents',
                config: {
                  eventTypes: [
                    'EmailAttestationPublished',
                    'FacebookAttestationPublished',
                    'AirbnbAttestationPublished'
                  ],
                  numEventsRequired: 2,
                  reward: null,
                  limit: 1,
                  upgradeCondition: true
                }
              }
            ],
          }
        }
      }
      const row = { id: 1 }
      const campaign = new Campaign(row, config)
      expect(campaign).to.be.an('object')
      expect(campaign.numLevels).to.equal(1)
      expect(campaign.levels[0]).to.be.an('object')
      expect(campaign.levels[0].rules.length).to.equal(1)
    })
  })
})