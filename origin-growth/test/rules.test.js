const chai = require('chai')
const expect = chai.expect

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
                  event: 'ProfilePublished',
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
                  events: ['EmailAttestation', 'FacebookAttestation', 'AirbnbAttestation'],
                  numRequired: 2,
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