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
                  scope: 'campaign'
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
          createdAt: this.duringCampaign
        },
        {
          id: 2,
          type: GrowthEventTypes.EmailAttestationPublished,
          status: GrowthEventStatuses.Logged,
          ethAddress: this.ethAddress,
          createdAt: this.duringCampaign
        },
        {
          id: 3,
          type: GrowthEventTypes.TwitterAttestationPublished,
          status: GrowthEventStatuses.Logged,
          ethAddress: this.ethAddress,
          createdAt: this.duringCampaign
        },
        {
          id: 4,
          type: GrowthEventTypes.FacebookAttestationPublished,
          status: GrowthEventStatuses.Logged,
          ethAddress: this.ethAddress,
          createdAt: this.duringCampaign
        },
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
        }
      ]
      this.crules.getEvents = (ethAddress, opts = {}) => {
        return this.events
          .filter(e => e.ethAddress === ethAddress)
          .filter(e => opts.duringCampaign ? (e.createdAt >= this.campaignStart && e.createdAt <= this.campaignEnd) : true)
      }

      const out = await campaignToApolloObject(
        this.crules,
        enums.GrowthParticipantAuthenticationStatus.Enrolled,
        this.ethAddress
      )

      //console.log(JSON.stringify(out))


      const actionByType = {}
      for(const action of out.actions) {
        actionByType[action.type] = action
      }

      const profile = actionByType['Profile']
      expect(profile.status).to.equal(enums.GrowthActionStatus.Completed)
      expect(profile.rewardEarned).to.deep.equal({ amount: '0', currency: 'OGN' })
      expect(profile.reward).to.be.null

      const email = actionByType['Email']
      expect(email.status).to.equal(enums.GrowthActionStatus.Completed)
      expect(email.rewardEarned).to.deep.equal({ amount: '0', currency: 'OGN' })
      expect(email.reward).to.be.null

      const phone = actionByType['Phone']
      expect(phone.status).to.equal(enums.GrowthActionStatus.Active)
      expect(phone.rewardEarned).to.deep.equal({ amount: '0', currency: 'OGN' })
      expect(phone.reward).to.deep.equal({ amount: '25000000000000000000', currency: 'OGN' })

      const fbook = actionByType['Facebook']
      expect(fbook.status).to.equal(enums.GrowthActionStatus.Completed)
      expect(fbook.rewardEarned).to.deep.equal({ amount: '25000000000000000000', currency: 'OGN' })
      expect(fbook.reward).to.deep.equal({ amount: '25000000000000000000', currency: 'OGN' })

      const air = actionByType['Airbnb']
      expect(air.status).to.equal(enums.GrowthActionStatus.Active)
      expect(air.rewardEarned).to.deep.equal({ amount: '0', currency: 'OGN' })
      expect(air.reward).to.deep.equal({ amount: '25000000000000000000', currency: 'OGN' })

      const twitter = actionByType['Twitter']
      expect(twitter.status).to.equal(enums.GrowthActionStatus.Completed)
      expect(twitter.rewardEarned).to.deep.equal({ amount: '25000000000000000000', currency: 'OGN' })
      expect(twitter.reward).to.deep.equal({ amount: '25000000000000000000', currency: 'OGN' })

      const purchased = actionByType['ListingPurchased']
      expect(purchased.status).to.equal(enums.GrowthActionStatus.Completed)
      expect(purchased.rewardEarned).to.deep.equal({ amount: '100000000000000000000', currency: 'OGN' })
      expect(purchased.reward).to.deep.equal({ amount: '100000000000000000000', currency: 'OGN' })

      const sold = actionByType['ListingSold']
      expect(sold.status).to.equal(enums.GrowthActionStatus.Active)
      expect(sold.rewardEarned).to.deep.equal({ amount: '0', currency: 'OGN' })
      expect(sold.reward).to.deep.equal({ amount: '100000000000000000000', currency: 'OGN' })

    })
  })
})