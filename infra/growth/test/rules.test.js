const chai = require('chai')
const expect = chai.expect

const { GrowthEventTypes, GrowthEventStatuses } = require('../src/enums')
const { CampaignRules, SocialShareRule } = require('../src/resources/rules')


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

      this.events = []
      this.crules.getEvents = (ethAddress) => {
        return this.events
          .filter(event => event.ethAddress === ethAddress)
      }

      this.ethAddress = '0x123'
    })

    it(`Should return level`, async () => {
      this.events = [
        {
          id: 1,
          type: GrowthEventTypes.ProfilePublished,
          status: GrowthEventStatuses.Verified,
          ethAddress: this.ethAddress
        }
      ]
      const level = await this.crules.getCurrentLevel(this.ethAddress)
      expect(level).to.equal(0)
    })

    it(`Should return 1 reward`, async () => {
      this.events = [
        {
          id: 1,
          type: GrowthEventTypes.ProfilePublished,
          status: GrowthEventStatuses.Verified,
          ethAddress: this.ethAddress
        }
      ]
      const level = await this.crules.getCurrentLevel(this.ethAddress)
      expect(level).to.equal(0)

      const rewards = await this.crules.getEarnedRewards(this.ethAddress)
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
      this.events = [
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

      const rewards = await this.crules.getEarnedRewards(this.ethAddress)
      const expectedRewards = []
      expect(rewards).to.deep.equal(expectedRewards)
    })

    it(`Should honor limit`, async () => {
      // 5 events but since limit is 2, only 2 rewards should be granted.
      this.events = Array(5).fill({
        id: 1,
        type: GrowthEventTypes.ProfilePublished,
        status: GrowthEventStatuses.Verified,
        ethAddress: this.ethAddress
      })

      const rewards = await this.crules.getEarnedRewards(this.ethAddress)
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

      this.events = []
      this.crules.getEvents = (ethAddress) => {
        return this.events
          .filter(event => event.ethAddress === ethAddress)
      }

      this.ethAddress = '0x123'
    })

    it(`Should return level`, async () => {
      this.events = []
      const level = await this.crules.getCurrentLevel(this.ethAddress)
      expect(level).to.equal(0)
    })

    it(`Should return 1 reward`, async () => {
      this.events = [
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

      const rewards = await this.crules.getEarnedRewards(this.ethAddress)
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
      this.events = [
        {
          id: 1,
          type: GrowthEventTypes.TwitterAttestationPublished,
          status: GrowthEventStatuses.Verified,
          ethAddress: this.ethAddress
        }
      ]

      const rewards = await this.crules.getEarnedRewards(this.ethAddress)
      const expectedRewards = []
      expect(rewards).to.deep.equal(expectedRewards)
    })

    it(`Should return no reward if events are invalid`, async () => {
      this.events = [
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

      const rewards = await this.crules.getEarnedRewards(this.ethAddress)
      const expectedRewards = []
      expect(rewards).to.deep.equal(expectedRewards)
    })

    it(`Should honor limit`, async () => {
      // 2 event tuples meet rules requirement. But limit is 1 -> only 1 reward should be granted.
      this.events = [
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

      const rewards = await this.crules.getEarnedRewards(this.ethAddress)
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

      this.events = [
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
      this.crules.getEvents = (ethAddress) => {
        return this.events
          .filter(event => event.ethAddress === ethAddress)
      }
    })

    it(`Should use events from inception to calculate level`, async () => {
      const level = await this.crules.getCurrentLevel(this.ethAddress)
      expect(level).to.equal(1)
    })

    it(`Should only use events from campaign period to calculate rewards`, async () => {
      const rewards = await this.crules.getEarnedRewards(this.ethAddress)
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

  describe('Proxy', () => {

    before(() => {
      const config = {
        numLevels: 1,
        levels: {
          0: {
            rules: [
              {
                id: 'Profile',
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

      this.ownerAddress = '0x123'
      this.proxyAddress = '0x456'

      this.events = []
      this.crules.getEvents = (ethAddress) => {
        return this.events
          .filter(event => (event.ethAddress === ethAddress) || (event.ethAddress === this.proxyAddress))
      }
    })

    it(`Events from proxy should be credited to owner`, async () => {
      this.events = [
        {
          id: 1,
          type: GrowthEventTypes.ProfilePublished,
          status: GrowthEventStatuses.Verified,
          ethAddress: this.proxyAddress
        }
      ]
      const level = await this.crules.getCurrentLevel(this.ownerAddress)
      expect(level).to.equal(0)

      const rewards = await this.crules.getEarnedRewards(this.ownerAddress)
      const expectedRewards = [{
        campaignId: 1,
        levelId: 0,
        ruleId: 'Profile',
        value: {
          currency: 'OGN',
          amount: 1
        }
      }]
      expect(rewards).to.deep.equal(expectedRewards)
    })
  })

  describe('Social rules reward calculation', () => {

    describe('Twitter', () => {
      before( () => {
        const crules = { campaign: { id: 1 } }
        const config = {
          config: {
            eventType: 'SharedOnTwitter',
            socialNetwork: 'twitter',
            reward: {
              amount: '0',
              currency: 'OGN'
            },
            content: {
              post: {
                text: {
                  default: 'tweet tweet',
                  translations: []
                }
              }
            },
            limit: 1,
            visible: true,
            scope: 'user',
            statusScope: 'user'
          }
        }
        this.rule = new SocialShareRule(crules, 0, config)
      })

      it(`should calculate reward properly based on social stats`, () => {
        const now = new Date()
        const oneMonthAgo = new Date(now.getTime() - 30*24*60*60*1000)
        const twoYearsAgo = new Date(now.getTime() - 2*365*24*60*60*1000)
        const twitterProfile = {
          created_at: oneMonthAgo.toString(),
          verified: false,
          followers_count: 0,
          status: {
            created_at: twoYearsAgo.toString()
          }
        }

        // Account younger than 1 year. No reward.
        let amount = this.rule._calcTwitterReward(twitterProfile)
        expect(amount).to.equal(0)

        // Account 2 years old but last tweet older than 1 year ago.
        twitterProfile.created_at = twoYearsAgo
        amount = this.rule._calcTwitterReward(twitterProfile)
        expect(amount).to.equal(0)

        // Account 2 years old and last tweet 1 month ago, but no followers.
        twitterProfile.status.created_at = oneMonthAgo
        amount = this.rule._calcTwitterReward(twitterProfile)
        expect(amount).to.equal(0)

        // Account with < 100 numFollowers. 1 OGN.
        twitterProfile.followers_count = 99
        amount = this.rule._calcTwitterReward(twitterProfile)
        expect(amount).to.equal(1)

        // Lot of followers.
        twitterProfile.followers_count = 3550
        amount = this.rule._calcTwitterReward(twitterProfile)
        expect(amount).to.equal(18)

        // Verified = x2
        twitterProfile.verified = true
        amount = this.rule._calcTwitterReward(twitterProfile)
        expect(amount).to.equal(36)
      })

      it(`should use stats from the user's identity to calculate the projected reward`, async () => {
        const now = new Date()
        const oneMonthAgo = new Date(now.getTime() - 30*24*60*60*1000)
        const twoYearsAgo = new Date(now.getTime() - 2*365*24*60*60*1000)
        const twitterProfile = {
          created_at: twoYearsAgo.toString(),
          verified: false,
          followers_count: 200,
          status: {
            created_at: oneMonthAgo.toString()
          }
        }
        const identity = { data: { twitterProfile } }
        const reward = await this.rule.getReward('0x123', identity)
        expect(reward.value.amount).to.equal('2')
        expect(reward.value.currency).to.equal('OGN')
      })

      it(`should use stats from events to calculate earned reward`, async () => {
        const now = new Date()
        const oneMonthAgo = new Date(now.getTime() - 30*24*60*60*1000)
        const twoYearsAgo = new Date(now.getTime() - 2*365*24*60*60*1000)
        const events = [
          {
            status: GrowthEventStatuses.Logged,
            type: 'SharedOnTwitter',
            data: {
              twitterProfile: {
                created_at: twoYearsAgo.toString(),
                verified: false,
                followers_count: 26300,
                status: {
                  created_at: oneMonthAgo.toString()
                }
              }
            },
            customId: this.rule._hashContent('tweet tweet')
          }
        ]
        const rewards = await this.rule.getEarnedRewards('0x123', events)
        expect(rewards.length).to.equal(1)
        expect(rewards[0].value.amount).to.equal('132')
        expect(rewards[0].value.currency).to.equal('OGN')
      })

    })
  })
})
