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
                  nextLevelCondition: false
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

    it(`Should return level`, async () => {
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
      const level = await this.campaign.getCurrentLevel(this.ethAddress)
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
      this.campaign.getEvents = () => { return events }
      const level = await this.campaign.getCurrentLevel(this.ethAddress)
      expect(level).to.equal(0)

      const rewards = await this.campaign.getRewards(this.ethAddress)
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
      this.campaign.getEvents = () => { return events }

      const rewards = await this.campaign.getRewards(this.ethAddress)
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
      this.campaign.getEvents = () => { return events }

      const rewards = await this.campaign.getRewards(this.ethAddress)
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
                  nextLevelCondition: true
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

    it(`Should return level`, async () => {
      const events = []
      this.campaign.getEvents = () => {
        return events
      }
      const level = await this.campaign.getCurrentLevel(this.ethAddress)
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
      this.campaign.getEvents = () => { return events }

      const rewards = await this.campaign.getRewards(this.ethAddress)
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
      this.campaign.getEvents = () => { return events }

      const rewards = await this.campaign.getRewards(this.ethAddress)
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
      this.campaign.getEvents = () => { return events }

      const rewards = await this.campaign.getRewards(this.ethAddress)
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
      this.campaign.getEvents = () => { return events }

      const rewards = await this.campaign.getRewards(this.ethAddress)
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

  describe('Multi Levels campaign', () => {

    before(() => {
      const config = {
        numLevels: 3,
        levels: {
          0: {
            rules: [
              {
                id: 'PreRequisite',
                class: 'MultiEvents',
                config: {
                  eventTypes: [
                    'ProfilePublished',
                    'EmailAttestationPublished'
                  ],
                  numEventsRequired: 2,
                  reward: null,
                  nextLevelCondition: true
                }
              }
            ],
          },
          1: {
            rules: [
              {
                id: 'PhoneAttestation',
                class: 'SingleEvent',
                config: {
                  eventType: 'PhoneAttestationPublished',
                  reward: {
                    amount: 10,
                    currency: 'OGN'
                  },
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
                    amount: 10,
                    currency: 'OGN'
                  },
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
                    amount: 10,
                    currency: 'OGN'
                  },
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
                    amount: 10,
                    currency: 'OGN'
                  },
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
                  numEventsRequired: 2,
                  reward: null,
                  nextLevelCondition: true
                }
              }
            ],
          },
          2: {
            rules: [
              {
                id: 'Referral',
                class: 'SingleEvent',
                config: {
                  eventType: 'RefereeSignedUp',
                  reward: {
                    amount: 10,
                    currency: 'OGN'
                  },
                  limit: 100,
                  nextLevelCondition: false
                }
              },
              {
                id: 'ListingCreation',
                class: 'SingleEvent',
                config: {
                  eventType: 'ListingCreated',
                  reward: {
                    amount: 5,
                    currency: 'OGN'
                  },
                  limit: 10,
                  nextLevelCondition: false
                }
              },
              {
                id: 'ListingPurchase',
                class: 'SingleEvent',
                config: {
                  eventType: 'ListingPurchased',
                  reward: {
                    amount: 5,
                    currency: 'OGN'
                  },
                  limit: 10,
                  nextLevelCondition: false
                }
              },
              {
                id: 'ListingSold',
                class: 'SingleEvent',
                config: {
                  eventType: 'ListingSold',
                  reward: {
                    amount: 5,
                    currency: 'OGN'
                  },
                  limit: 10,
                  nextLevelCondition: false
                }
              }
            ],
          }
        }
      }
      const row = { id: 1 }
      this.campaign = new Campaign(row, config)
      expect(this.campaign).to.be.an('object')
      expect(this.campaign.numLevels).to.equal(3)
      expect(this.campaign.levels[0]).to.be.an('object')
      expect(this.campaign.levels[0].rules.length).to.equal(1)
      expect(this.campaign.levels[1]).to.be.an('object')
      expect(this.campaign.levels[1].rules.length).to.equal(5)
      expect(this.campaign.levels[2]).to.be.an('object')
      expect(this.campaign.levels[2].rules.length).to.equal(4)

      this.ethAddress = '0x123'
      this.expectedRewards = []
    })

    it(`Should start at level 0`, async () => {
      const events = []
      this.campaign.getEvents = () => {
        return events
      }
      const level = await this.campaign.getCurrentLevel(this.ethAddress)
      expect(level).to.equal(0)
    })

    it(`Should graduate to level 1`, async () => {
      this.events = [
        {
          id: 1,
          type: GrowthEventTypes.ProfilePublished,
          status: GrowthEventStatuses.Logged,
          ethAddress: this.ethAddress
        },
        {
          id: 2,
          type: GrowthEventTypes.EmailAttestationPublished,
          status: GrowthEventStatuses.Logged,
          ethAddress: this.ethAddress
        }
      ]
      this.campaign.getEvents = () => {
        return this.events
      }

      const rewards = await this.campaign.getRewards(this.ethAddress)
      expect(rewards).to.deep.equal([])

      const level = await this.campaign.getCurrentLevel(this.ethAddress)
      expect(level).to.equal(1)
    })

    it(`Should graduate to level 2`, async () => {
      this.events.push(
        {
          id: 3,
          type: GrowthEventTypes.TwitterAttestationPublished,
          status: GrowthEventStatuses.Logged,
          ethAddress: this.ethAddress
        },
        {
          id: 4,
          type: GrowthEventTypes.FacebookAttestationPublished,
          status: GrowthEventStatuses.Logged,
          ethAddress: this.ethAddress
        }
      )
      this.campaign.getEvents = () => { return this.events }

      const rewards = await this.campaign.getRewards(this.ethAddress)
      this.expectedRewards.push(
        {
          campaignId: 1,
          levelId: 1,
          ruleId: 'FacebookAttestation',
          value: {
            currency: 'OGN',
            amount: 10
          },
        },
        {
          campaignId: 1,
          levelId: 1,
          ruleId: 'TwitterAttestation',
          value: {
            currency: 'OGN',
            amount: 10
          }
        }
      )
      expect(rewards).to.deep.equal(this.expectedRewards)

      const level = await this.campaign.getCurrentLevel(this.ethAddress)
      expect(level).to.equal(2)
    })

    it(`Should remain on level 2 when referees sign up`, async () => {
      this.events.push(
        {
          id: 9,
          type: GrowthEventTypes.RefereeSignedUp,
          status: GrowthEventStatuses.Verified,
          ethAddress: this.ethAddress
        }
      )
      this.campaign.getEvents = () => { return this.events }

      const rewards = await  this.campaign.getRewards(this.ethAddress)
      this.expectedRewards.push({
        campaignId: 1,
        levelId: 2,
        ruleId: 'Referral',
        value: {
          currency: 'OGN',
          amount: 10
        }
      })
      expect(rewards).to.deep.equal(this.expectedRewards)

      const level = await  this.campaign.getCurrentLevel(this.ethAddress)
      expect(level).to.equal(2)
    })

    it(`Should remain on level 2 when a listing is created`, async () => {
      this.events.push(
        {
          id: 5,
          type: GrowthEventTypes.ListingCreated,
          status: GrowthEventStatuses.Logged,
          ethAddress: this.ethAddress
        }
      )
      this.campaign.getEvents = () => { return this.events }

      const rewards = await this.campaign.getRewards(this.ethAddress)
      this.expectedRewards.push({
        campaignId: 1,
        levelId: 2,
        ruleId: 'ListingCreation',
        value: {
          currency: 'OGN',
          amount: 5
        }
      })
      expect(rewards).to.deep.equal(this.expectedRewards)

      const level = await this.campaign.getCurrentLevel(this.ethAddress)
      expect(level).to.equal(2)
    })

    it(`Should remain on level 2 when a listing is purchased`, async () => {
      this.events.push(
        {
          id: 6,
          type: GrowthEventTypes.ListingPurchased,
          status: GrowthEventStatuses.Logged,
          ethAddress: this.ethAddress
        }
      )
      this.campaign.getEvents = () => { return this.events }

      const rewards = await this.campaign.getRewards(this.ethAddress)
      this.expectedRewards.push({
        campaignId: 1,
        levelId: 2,
        ruleId: 'ListingPurchase',
        value: {
          currency: 'OGN',
          amount: 5
        }
      })
      expect(rewards).to.deep.equal(this.expectedRewards)

      const level = await this.campaign.getCurrentLevel(this.ethAddress)
      expect(level).to.equal(2)
    })

    it(`Should remain on level 2 when a listing is sold`, async () => {
      this.events.push(
        {
          id: 6,
          type: GrowthEventTypes.ListingSold,
          status: GrowthEventStatuses.Logged,
          ethAddress: this.ethAddress
        }
      )
      this.campaign.getEvents = () => { return this.events }

      const rewards = await this.campaign.getRewards(this.ethAddress)
      this.expectedRewards.push({
        campaignId: 1,
        levelId: 2,
        ruleId: 'ListingSold',
        value: {
          currency: 'OGN',
          amount: 5
        }
      })
      expect(rewards).to.deep.equal(this.expectedRewards)

      const level = await this.campaign.getCurrentLevel(this.ethAddress)
      expect(level).to.equal(2)
    })

    it(`Should honor limits`, async () => {
      this.events.push(
        ...Array(200).fill({
          id: 10,
          type: GrowthEventTypes.RefereeSignedUp,
          status: GrowthEventStatuses.Verified,
          ethAddress: this.ethAddress
        }),
        ...Array(200).fill({
          id: 12,
            type: GrowthEventTypes.ListingCreated,
          status: GrowthEventStatuses.Logged,
          ethAddress: this.ethAddress
        }),
        ...Array(200).fill({
          id: 16,
            type: GrowthEventTypes.ListingPurchased,
          status: GrowthEventStatuses.Logged,
          ethAddress: this.ethAddress
        }),
        ...Array(200).fill({
          id: 16,
          type: GrowthEventTypes.ListingSold,
          status: GrowthEventStatuses.Logged,
          ethAddress: this.ethAddress
        })
      )
      this.campaign.getEvents = () => { return this.events }

      const rewards = await this.campaign.getRewards(this.ethAddress)
      this.expectedRewards = [
        {
          campaignId: 1,
          levelId: 1,
          ruleId: 'FacebookAttestation',
          value: { amount: 10, currency: 'OGN' }
        },
        {
          campaignId: 1,
          levelId: 1,
          ruleId: 'TwitterAttestation',
          value: { amount: 10, currency: 'OGN' }
        },
        ...Array(100).fill({
          campaignId: 1,
          levelId: 2,
          ruleId: 'Referral',
          value: {
            currency: 'OGN',
            amount: 10
          }
        }),
        ...Array(10).fill({
          campaignId: 1,
          levelId: 2,
          ruleId: 'ListingCreation',
          value: {
            currency: 'OGN',
            amount: 5
          }
        }),
        ...Array(10).fill({
          campaignId: 1,
          levelId: 2,
          ruleId: 'ListingPurchase',
          value: {
            currency: 'OGN',
            amount: 5
          }
        }),
        ...Array(10).fill({
          campaignId: 1,
          levelId: 2,
          ruleId: 'ListingSold',
          value: {
            currency: 'OGN',
            amount: 5
          }
        })
      ]
      expect(rewards).to.deep.equal(this.expectedRewards)

      const level = await this.campaign.getCurrentLevel(this.ethAddress)
      expect(level).to.equal(2)
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
                  eventType: GrowthEventTypes.RefereeSignedUp,
                  reward: null,
                  nextLevelCondition: true
                }
              }
            ],
          },
          1: {
            rules: [
              {
                id: 'Referral',
                class: 'SingleEvent',
                config: {
                  eventType: GrowthEventTypes.RefereeSignedUp,
                  reward: {
                    amount: 1,
                    currency: 'OGN'
                  },
                  limit: 10,
                  nextLevelCondition: false
                }
              }
            ],
          }
        }
      }
      const row = { id: 1, startDate: 10, endDate: 100 }
      this.campaign = new Campaign(row, config)
      expect(this.campaign).to.be.an('object')
      expect(this.campaign.numLevels).to.equal(2)

      this.ethAddress = '0x123'

      const events = [
        {
          id: 1,
          type: GrowthEventTypes.RefereeSignedUp,
          status: GrowthEventStatuses.Verified,
          ethAddress: this.ethAddress,
          createdAt: 1 // Occurred prior to campaign start.
        },
        {
          id: 2,
          type: GrowthEventTypes.RefereeSignedUp,
          status: GrowthEventStatuses.Verified,
          ethAddress: this.ethAddress,
          createdAt: 50 // Occurred after campaign start.
        },
        {
          id: 3,
          type: GrowthEventTypes.RefereeSignedUp,
          status: GrowthEventStatuses.Verified,
          ethAddress: this.ethAddress,
          createdAt: 150 // Occurred after campaign end.
        }
      ]
      this.campaign.getEvents = (ethAddress, duringCampaign) => {
        return events
          .filter(event => {
            return duringCampaign
              ? event.createdAt >= this.campaign.campaign.startDate &&
              event.createdAt < this.campaign.campaign.endDate
              : true
          })
      }
    })

    it(`Should use events from inception for level calculation`, async () => {
      const level = await this.campaign.getCurrentLevel(this.ethAddress)
      expect(level).to.equal(1)
    })

    it(`Should use events from campaign period for reward calculation`, async () => {
      const rewards = await this.campaign.getRewards(this.ethAddress)
      const expectedRewards = [{
        campaignId: 1,
        levelId: 1,
        ruleId: 'Referral',
        value: {
          currency: 'OGN',
          amount: 1
        }
      }]
      expect(rewards).to.deep.equal(expectedRewards)
    })
  })
})