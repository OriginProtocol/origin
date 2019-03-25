const BigNumber = require('bignumber.js')
const chai = require('chai')
const expect = chai.expect

const { GrowthEventTypes, GrowthEventStatuses } = require('../src/enums')
const { CampaignRules } = require('../src/resources/rules')
const { campaignToApolloObject } = require('../src/apollo/adapter')
const enums = require('../src/enums')



function tokenNaturalUnits(x) {
  return BigNumber(x)
    .times(BigNumber(10).pow(18))
    .toFixed()
}

describe('Apollo adapter', () => {


  describe('March campaign rules', () => {

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
                  scope: 'user'
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
                  nextLevelCondition: false,
                  scope: 'user'
                }
              },
              {
                id: 'BasicProfile',
                class: 'MultiEvents',
                config: {
                  eventTypes: ['ProfilePublished', 'EmailAttestationPublished'],
                  visible: false,
                  repeatable: false,
                  numEventsRequired: 2,
                  reward: null,
                  nextLevelCondition: true,
                  scope: 'user',
                  unlockConditionMsg: [
                    {
                      conditionTranslateKey: 'growth.profile.and.email.requirement',
                      conditionIcon: 'images/growth/email-icon-small.svg'
                    }
                  ],
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
                    amount: tokenNaturalUnits(25),
                    currency: 'OGN'
                  },
                  limit: 1,
                  nextLevelCondition: false,
                  visible: true,
                  scope: 'user'
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
                  limit: 1,
                  nextLevelCondition: false,
                  visible: true,
                  scope: 'user'
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
                  limit: 1,
                  nextLevelCondition: false,
                  visible: true,
                  scope: 'user'
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
                  limit: 1,
                  nextLevelCondition: false,
                  visible: true,
                  scope: 'user'
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
                  nextLevelCondition: true,
                  unlockConditionMsg: [
                    {
                      conditionTranslateKey: 'growth.two.attestations.requirement',
                      conditionIcon: 'images/growth/attestation-icon.svg'
                    }
                  ],
                  visible: false,
                  scope: 'user'
                }
              }
            ],
          },
          2: {
            rules: [
              {
                id: 'Referral',
                class: 'Referral',
                config: {
                  levelRequired: 1,
                  reward: {
                    amount: tokenNaturalUnits(50),
                    currency: 'OGN'
                  },
                  limit: 25,
                  nextLevelCondition: false,
                  visible: true,
                  scope: 'campaign'
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
                  limit: 1,
                  nextLevelCondition: false,
                  visible: true,
                  scope: 'campaign'
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
                  limit: 1,
                  nextLevelCondition: false,
                  visible: true,
                  scope: 'campaign'
                }
              }
            ],
          }
        }
      }
      this.campaignStart = new Date()
      this.campaignEnd = new Date(this.campaignStart.getTime()+100000)
      this.duringCampaign = new Date(this.campaignStart.getTime()+100)
      this.beforeCampaign = new Date(this.campaignStart.getTime()-100000)
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
      expect(this.crules.levels[1].rules.length).to.equal(5)
      expect(this.crules.levels[2]).to.be.an('object')
      expect(this.crules.levels[2].rules.length).to.equal(3)

      // Mock the getEvents method.
      this.crules.getEvents = (ethAddress, opts = {}) => {
        return this.events
          .filter(e => e.ethAddress === ethAddress)
          .filter(e => opts.duringCampaign ? (e.createdAt >= this.campaignStart && e.createdAt <= this.campaignEnd) : true)
      }

      this.ethAddress = '0x123'
      this.refereeEthAddress = '0xABC'
      this.events = []
    })


    it(`Adapter at level 0`, async () => {
      const out = await campaignToApolloObject(
        this.crules,
        enums.GrowthParticipantAuthenticationStatus.Enrolled,
        this.ethAddress
      )

      expect(out.rewardEarned).to.deep.equal({ amount: '0', currency: 'OGN' })

      const actionByType = {}
      for(const action of out.actions) {
        actionByType[action.type] = action
      }

      const expectedActionStates = {
        Profile: {
          status: 'Active',
          rewardEarned: { amount: '0', currency: 'OGN' }
        },
        Email: {
          status: 'Active',
          rewardEarned: { amount: '0', currency: 'OGN' }
        },
        Phone: {
          status: 'Inactive',
          rewardEarned: { amount: '0', currency: 'OGN' }
        },
        Airbnb: {
          status: 'Inactive',
          rewardEarned: { amount: '0', currency: 'OGN' }
        },
        Facebook: {
          status: 'Inactive',
          rewardEarned: { amount: '0', currency: 'OGN' }
        },
        Twitter: {
          status: 'Inactive',
          rewardEarned: { amount: '0', currency: 'OGN' }
        },
        ListingPurchased: {
          status: 'Inactive',
          rewardEarned: { amount: '0', currency: 'OGN' }
        },
        ListingSold: {
          status: 'Inactive',
          rewardEarned: { amount: '0', currency: 'OGN' }
        },
        Referral: {
          status: 'Inactive',
          rewardEarned: { amount: '0', currency: 'OGN' }
        },
      }

      for (const [actionType, expectedState] of Object.entries(expectedActionStates)) {
        const action = actionByType[actionType]
        expect(action.status).to.deep.equal(expectedState.status)
        expect(action.rewardEarned).to.deep.equal(expectedState.rewardEarned)
      }
    })

    it(`Adapter completed level 0`, async () => {
      this.events.push(...[
        // Published before campaign. Event should still be considered
        // when computing next level.
        {
          id: 1,
          type: GrowthEventTypes.ProfilePublished,
          status: GrowthEventStatuses.Logged,
          ethAddress: this.ethAddress,
          createdAt: this.beforeCampaign
        },
        {
          id: 2,
          type: GrowthEventTypes.EmailAttestationPublished,
          status: GrowthEventStatuses.Logged,
          ethAddress: this.ethAddress,
          createdAt: this.duringCampaign
        }
      ])

      const out = await campaignToApolloObject(
        this.crules,
        enums.GrowthParticipantAuthenticationStatus.Enrolled,
        this.ethAddress
      )

      expect(out.rewardEarned).to.deep.equal({ amount: '0', currency: 'OGN' })

      const actionByType = {}
      for(const action of out.actions) {
        actionByType[action.type] = action
      }

      const expectedActionStates = {
        Profile: {
          status: 'Completed',
          rewardEarned: { amount: '0', currency: 'OGN' }
        },
        Email: {
          status: 'Completed',
          rewardEarned: { amount: '0', currency: 'OGN' }
        },
        Phone: {
          status: 'Active',
          rewardEarned: { amount: '0', currency: 'OGN' }
        },
        Airbnb: {
          status: 'Active',
          rewardEarned: { amount: '0', currency: 'OGN' }
        },
        Facebook: {
          status: 'Active',
          rewardEarned: { amount: '0', currency: 'OGN' }
        },
        Twitter: {
          status: 'Active',
          rewardEarned: { amount: '0', currency: 'OGN' }
        },
        ListingPurchased: {
          status: 'Inactive',
          rewardEarned: { amount: '0', currency: 'OGN' }
        },
        ListingSold: {
          status: 'Inactive',
          rewardEarned: { amount: '0', currency: 'OGN' }
        },
        Referral: {
          status: 'Inactive',
          rewardEarned: { amount: '0', currency: 'OGN' }
        },
      }

      for (const [actionType, expectedState] of Object.entries(expectedActionStates)) {
        const action = actionByType[actionType]
        expect(action.status).to.be.equal(expectedState.status)
        expect(action.rewardEarned).to.deep.equal(expectedState.rewardEarned)
      }
    })

    it(`Adapter completed level 1`, async () => {
      this.events.push(...[
        // Attestation completed prior to campaign.
        // Should still qualify to earn reward.
        {
          id: 3,
          type: GrowthEventTypes.TwitterAttestationPublished,
          status: GrowthEventStatuses.Logged,
          ethAddress: this.ethAddress,
          createdAt: this.beforeCampaign
        },
        {
          id: 4,
          type: GrowthEventTypes.FacebookAttestationPublished,
          status: GrowthEventStatuses.Logged,
          ethAddress: this.ethAddress,
          createdAt: this.duringCampaign
        },
      ])

      const out = await campaignToApolloObject(
        this.crules,
        enums.GrowthParticipantAuthenticationStatus.Enrolled,
        this.ethAddress
      )

      expect(out.rewardEarned).to.deep.equal({ amount: '50000000000000000000', currency: 'OGN' })

      const actionByType = {}
      for(const action of out.actions) {
        actionByType[action.type] = action
      }

      const expectedActionStates = {
        Profile: {
          status: 'Completed',
          rewardEarned: { amount: '0', currency: 'OGN' }
        },
        Email: {
          status: 'Completed',
          rewardEarned: { amount: '0', currency: 'OGN' }
        },
        Phone: {
          status: 'Active',
          rewardEarned: { amount: '0', currency: 'OGN' }
        },
        Airbnb: {
          status: 'Active',
          rewardEarned: { amount: '0', currency: 'OGN' }
        },
        Facebook: {
          status: 'Completed',
          rewardEarned: { amount: '25000000000000000000', currency: 'OGN' }
        },
        Twitter: {
          status: 'Completed',
          rewardEarned: { amount: '25000000000000000000', currency: 'OGN' }
        },
        ListingPurchased: {
          status: 'Active',
          rewardEarned: { amount: '0', currency: 'OGN' }
        },
        ListingSold: {
          status: 'Active',
          rewardEarned: { amount: '0', currency: 'OGN' }
        },
        Referral: {
          status: 'Active',
          rewardEarned: { amount: '0', currency: 'OGN' }
        },
      }

      for (const [actionType, expectedState] of Object.entries(expectedActionStates)) {
        const action = actionByType[actionType]
        expect(action.status).to.be.equal(expectedState.status)
        expect(action.rewardEarned).to.deep.equal(expectedState.rewardEarned)
      }
    })

    it(`Adapter at level 2`, async () => {
      this.events.push(...[
        // Listing sold prior to the campaign.
        // Should not earn reward.
        {
          id: 5,
          type: GrowthEventTypes.ListingSold,
          status: GrowthEventStatuses.Logged,
          ethAddress: this.ethAddress,
          createdAt: this.beforeCampaign
        },
        // Listing purchased during the campaign. Qualifies for reward.
        {
          id: 6,
          type: GrowthEventTypes.ListingPurchased,
          status: GrowthEventStatuses.Logged,
          ethAddress: this.ethAddress,
          createdAt: this.duringCampaign
        },
        {
          id: 7,
          type: GrowthEventTypes.AirbnbAttestationPublished,
          status: GrowthEventStatuses.Logged,
          ethAddress: this.ethAddress,
          createdAt: this.duringCampaign
        }
      ])

      const out = await campaignToApolloObject(
        this.crules,
        enums.GrowthParticipantAuthenticationStatus.Enrolled,
        this.ethAddress
      )

      expect(out.rewardEarned).to.deep.equal({ amount: '175000000000000000000', currency: 'OGN' })

      const actionByType = {}
      for(const action of out.actions) {
        actionByType[action.type] = action
      }

      const expectedActionStates = {
        Profile: {
          status: 'Completed',
          rewardEarned: { amount: '0', currency: 'OGN' }
        },
        Email: {
          status: 'Completed',
          rewardEarned: { amount: '0', currency: 'OGN' }
        },
        Phone: {
          status: 'Active',
          rewardEarned: { amount: '0', currency: 'OGN' }
        },
        Airbnb: {
          status: 'Completed',
          rewardEarned: { amount: '25000000000000000000', currency: 'OGN' }
        },
        Facebook: {
          status: 'Completed',
          rewardEarned: { amount: '25000000000000000000', currency: 'OGN' }
        },
        Twitter: {
          status: 'Completed',
          rewardEarned: { amount: '25000000000000000000', currency: 'OGN' }
        },
        ListingPurchased: {
          status: 'Completed',
          rewardEarned: { amount: '100000000000000000000', currency: 'OGN' }
        },
        ListingSold: {
          status: 'Active',
          rewardEarned: { amount: '0', currency: 'OGN' }
        },
      }
      for (const [actionType, expectedState] of Object.entries(expectedActionStates)) {
        const action = actionByType[actionType]
        expect(action.status).to.be.equal(expectedState.status)
        expect(action.rewardEarned).to.deep.equal(expectedState.rewardEarned)
      }
    })

    it(`Adapter at level 2 with a referral`, async () => {
      this.events.push(...[
        {
          id: 8,
          type: GrowthEventTypes.ProfilePublished,
          status: GrowthEventStatuses.Logged,
          ethAddress: this.refereeEthAddress,
          createdAt: this.beforeCampaign
        },
        {
          id: 9,
          type: GrowthEventTypes.EmailAttestationPublished,
          status: GrowthEventStatuses.Logged,
          ethAddress: this.refereeEthAddress,
          createdAt: this.duringCampaign
        },
        {
          id: 10,
          type: GrowthEventTypes.PhoneAttestationPublished,
          status: GrowthEventStatuses.Logged,
          ethAddress: this.refereeEthAddress,
          createdAt: this.beforeCampaign
        },
        {
          id: 11,
          type: GrowthEventTypes.AirbnbAttestationPublished,
          status: GrowthEventStatuses.Logged,
          ethAddress: this.refereeEthAddress,
          createdAt: this.duringCampaign
        },
      ])

      const out = await campaignToApolloObject(
        this.crules,
        enums.GrowthParticipantAuthenticationStatus.Enrolled,
        this.ethAddress
      )

      expect(out.rewardEarned).to.deep.equal({ amount: '175000000000000000000', currency: 'OGN' })

      const actionByType = {}
      for(const action of out.actions) {
        actionByType[action.type] = action
      }

      const expectedActionStates = {
        Profile: {
          status: 'Completed',
          rewardEarned: { amount: '0', currency: 'OGN' }
        },
        Email: {
          status: 'Completed',
          rewardEarned: { amount: '0', currency: 'OGN' }
        },
        Phone: {
          status: 'Active',
          rewardEarned: { amount: '0', currency: 'OGN' }
        },
        Airbnb: {
          status: 'Completed',
          rewardEarned: { amount: '25000000000000000000', currency: 'OGN' }
        },
        Facebook: {
          status: 'Completed',
          rewardEarned: { amount: '25000000000000000000', currency: 'OGN' }
        },
        Twitter: {
          status: 'Completed',
          rewardEarned: { amount: '25000000000000000000', currency: 'OGN' }
        },
        ListingPurchased: {
          status: 'Completed',
          rewardEarned: { amount: '100000000000000000000', currency: 'OGN' }
        },
        ListingSold: {
          status: 'Active',
          rewardEarned: { amount: '0', currency: 'OGN' }
        },
      }
      for (const [actionType, expectedState] of Object.entries(expectedActionStates)) {
        const action = actionByType[actionType]
        expect(action.status).to.be.equal(expectedState.status)
        expect(action.rewardEarned).to.deep.equal(expectedState.rewardEarned)
      }
    })
  })
})