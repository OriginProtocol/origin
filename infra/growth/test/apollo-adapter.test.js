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
                  repeatable: false
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
                  repeatable: false
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
                  repeatable: false
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
                  repeatable: false
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
                  repeatable: false
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
                  repeatable: false
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
                      conditionTranslateKey: 'growth.profile.and.email.requirement',
                      conditionIcon: 'images/growth/email-icon-small.svg',
                    }
                  ],
                  visible: false,
                  repeatable: false
                }
              }
            ],
          },
          2: {
            rules: [
              /**
               TODO: test Referral. It is failing due to trying to
               call non-mocked method GrowthInvite.getReferralsInfo
               from within the adapter code...
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
                  repeatable: true
                }
              },
               */
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
                  repeatable: true
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
                  repeatable: true
                }
              }
            ],
          }
        }
      }
      const row = {
        id: 1,
        rules: JSON.stringify(config),
        startDate: new Date(),
        endDate: new Date(new Date().getTime()+100000),
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
      expect(this.crules.levels[2].rules.length).to.equal(2)

      this.ethAddress = '0x123'
    })

    it(`Adapter should run`, async () => {
      this.events = [
        {
          id: 1,
          type: GrowthEventTypes.ProfilePublished,
          status: GrowthEventStatuses.Logged,
          ethAddress: this.ethAddress,
          createdAt: new Date()
        },
        {
          id: 2,
          type: GrowthEventTypes.EmailAttestationPublished,
          status: GrowthEventStatuses.Logged,
          ethAddress: this.ethAddress,
          createdAt: new Date()
        },
        {
          id: 3,
          type: GrowthEventTypes.TwitterAttestationPublished,
          status: GrowthEventStatuses.Logged,
          ethAddress: this.ethAddress,
          createdAt: new Date()
        },
        {
          id: 4,
          type: GrowthEventTypes.FacebookAttestationPublished,
          status: GrowthEventStatuses.Logged,
          ethAddress: this.ethAddress,
          createdAt: new Date()
        },
        {
          id: 5,
          type: GrowthEventTypes.ListingPurchased,
          status: GrowthEventStatuses.Logged,
          ethAddress: this.ethAddress,
          createdAt: new Date()
        }

      ]
      this.crules.getEvents = () => {
        return this.events
      }

      const out = await campaignToApolloObject(
        this.crules,
        enums.GrowthParticipantAuthenticationStatus.Enrolled,
        this.ethAddress
      )

      const actionByType = {}
      for(const action of out.actions) {
        actionByType[action.type] = action
      }
      expect(actionByType['Profile'].status).to.equal(enums.GrowthActionStatus.Completed)
      expect(actionByType['Email'].status).to.equal(enums.GrowthActionStatus.Completed)
      expect(actionByType['Phone'].status).to.equal(enums.GrowthActionStatus.Active)
      expect(actionByType['Facebook'].status).to.equal(enums.GrowthActionStatus.Completed)
      expect(actionByType['Airbnb'].status).to.equal(enums.GrowthActionStatus.Active)
      expect(actionByType['Twitter'].status).to.equal(enums.GrowthActionStatus.Completed)
      expect(actionByType['ListingPurchased'].status).to.equal(enums.GrowthActionStatus.Completed)
      expect(actionByType['ListingSold'].status).to.equal(enums.GrowthActionStatus.Active)
    })
  })
})