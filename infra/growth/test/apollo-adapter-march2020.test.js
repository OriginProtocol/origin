const chai = require('chai')
const expect = chai.expect
const assert = chai.assert

const { GrowthEventTypes, GrowthEventStatuses } = require('../src/enums')
const { CampaignRules } = require('../src/resources/rules')
const { ApolloAdapter, campaignToApolloObject } = require('../src/apollo/adapter')
const enums = require('../src/enums')
const db = require('../src/models')
let eventId = 0

function checkExpectedState(state, expectedState) {
  expect(state.rewardEarned).to.deep.equal(expectedState.rewardEarned)
  expect(state.actions.length).to.equal(14) // Note: adjust based on number of rules.

  const actionByRuleId = {}
  for(const action of state.actions) {
    actionByRuleId[action.ruleId] = action
  }

  for (const [key, val] of Object.entries(expectedState)) {
    if (key === 'rewardEarned') {
      continue
    }
    const ruleId = key
    const expectedAction = val
    const action = actionByRuleId[ruleId]
    if (!action) {
      throw new Error('NO action for ruleId' + ruleId)
    }

    expect(action.type).to.equal(expectedAction.type)
    expect(action.status).to.deep.equal(expectedAction.status)
    expect(action.rewardEarned).to.deep.equal(expectedAction.rewardEarned)
    expect(action.reward).to.deep.equal(expectedAction.reward)
    if (expectedAction.limit) {
      expect(action.limit).to.equal(expectedAction.limit)
    }
    if (action.type === 'ListingIdPurchased') {
      expect(action.listingId).to.be.a('string')
      expect(action.iconSrc).to.be.a('string')
      expect(action.title).to.be.a('string')
      expect(action.details).to.be.a('string')
    }
  }
}

async function createReferral(referrer, referee) {
  // Create the referral if it does not already exist.
  // TODO: ideally we should use a mocked DB.
  const existing = await db.GrowthReferral.findOne({
      where: {
        referrerEthAddress: referrer,
        refereeEthAddress: referee
      }
    }
  )
  if (!existing) {
    await db.GrowthReferral.create({
      referrerEthAddress: referrer,
      refereeEthAddress: referee
    })
  }
}

function createCampaignRules(config, context) {
  const row = {
    id: eventId++,
    rules: JSON.stringify(config),
    startDate: context.campaignStart,
    endDate: context.campaignEnd,
    currency: 'OGN'
  }

  context.crules = new CampaignRules(row, config)

  // Mock the getEvents method to use events from context.events.
  // When writing a test, be aware that context.events is global and shared with other tests.
  context.events = []
  context.crules.getEvents = (ethAddress, opts = {}) => {
    return context.events
      .filter(e => e.ethAddress === ethAddress)
      .filter(e => opts.duringCampaign ? (e.createdAt >= context.campaignStart && e.createdAt <= context.campaignEnd) : true)
      .filter(e => opts.beforeCampaign ? (e.createdAt < context.campaignStart) : true)
  }
}

describe('Apollo adapter - Mar 2020 campaign', () => {
  before(async () => {
    const mar2020Config = require('../campaigns/mar2020')
    this.campaignStart = new Date()
    this.campaignEnd = new Date(this.campaignStart.getTime()+100000)
    this.duringCampaign = new Date(this.campaignStart.getTime()+100)
    this.beforeCampaign = new Date(this.campaignStart.getTime()-100000)

    createCampaignRules(mar2020Config, this)

    expect(this.crules).to.be.an('object')
    expect(this.crules.numLevels).to.equal(3)
    expect(this.crules.levels[0]).to.be.an('object')
    expect(this.crules.levels[0].rules.length).to.equal(3) // Note: adjust based on number of rules.
    expect(this.crules.levels[1]).to.be.an('object')
    expect(this.crules.levels[1].rules.length).to.equal(12) // Note: adjust based on number of rules.
    expect(this.crules.levels[2]).to.be.an('object')
    expect(this.crules.levels[2].rules.length).to.equal(1) // Note: adjust based on number of rules.

    this.userA = '0xA123'
    this.userB = '0xB456'
    this.userC = '0xC789'
    this.notEnrolledUser = null

    // User A is referrer for user B and C.
    await createReferral(this.userA, this.userB)
    await createReferral(this.userA, this.userC)

    // Mock the adapter's _getReferralActionData to avoid
    // setting up all the DB entries required for method
    // GrowthInvite.getReferralsInfo that it depends on to work in test.
    this.mockAdapter = new ApolloAdapter()
    this.mockAdapter._getReferralsActionData = async () => { return {} }

    this.expectedState = {
      rewardEarned: {
        amount: '0',currency: 'OGN'
      },
      ProfilePublished: {
        type: 'Profile',
        status: 'Active',
        rewardEarned: { amount: '0', currency: 'OGN' },
        reward: null
      },
      EmailAttestation: {
        type: 'Email',
        status: 'Active',
        rewardEarned: { amount: '0', currency: 'OGN' },
        reward: null
      },
      PhoneAttestation: {
        type: 'Phone',
        status: 'Inactive',
        rewardEarned: { amount: '0', currency: 'OGN' },
        reward: null
      },
      FacebookAttestation: {
        type: 'Facebook',
        status: 'Inactive',
        rewardEarned: { amount: '0', currency: 'OGN' },
        reward: null
      },
      TwitterAttestation: {
        type: 'Twitter',
        status: 'Inactive',
        rewardEarned: { amount: '0', currency: 'OGN' },
        reward: null
      },
      KakaoAttestation: {
        type: 'Kakao',
        status: 'Inactive',
        rewardEarned: { amount: '0', currency: 'OGN' },
        reward: null
      },
      TelegramAttestation: {
        type: 'Telegram',
        status: 'Inactive',
        rewardEarned: { amount: '0', currency: 'OGN' },
        reward: null
      },
      Referral: {
        type: 'Referral',
        status: 'Inactive',
        rewardEarned: { amount: '0', currency: 'OGN' },
        reward: null
      },
      TwitterShare41: {
        type: 'TwitterShare',
        status: 'Inactive',
        rewardEarned: { amount: '0', currency: 'OGN' },
        reward: null
      },
      TwitterFollow: {
        type: 'TwitterFollow',
        status: 'Inactive',
        rewardEarned: { amount: '0', currency: 'OGN' },
        reward: null
      },
      TelegramFollow: {
        type: 'TelegramFollow',
        status: 'Inactive',
        rewardEarned: { amount: '0', currency: 'OGN' },
        reward: null
      },
      FacebookShare41: {
        type: 'FacebookShare',
        status: 'Inactive',
        rewardEarned: { amount: '0', currency: 'OGN' },
        reward: null
      },
      FacebookLike: {
        type: 'FacebookLike',
        status: 'Inactive',
        rewardEarned: { amount: '0', currency: 'OGN' },
        reward: null
      }
    }

    this.expectedNonSignedInState = {}

    Object.entries(this.expectedState).forEach(([key, value]) => {
      if (value.status) {
        this.expectedNonSignedInState[key] = { ...value, status: null }
      } else {
        this.expectedNonSignedInState[key] = { ...value }
      }
    })

  })

  it(`Adapter at level 0`, async () => {
    const state = await campaignToApolloObject(
      this.crules,
      enums.GrowthParticipantAuthenticationStatus.Enrolled,
      this.userA,
      this.mockAdapter
    )
    checkExpectedState(state, this.expectedState)
  })

  it(`Adapter when user not logged in`, async () => {
    const state = await campaignToApolloObject(
      this.crules,
      enums.GrowthParticipantAuthenticationStatus.Enrolled,
      this.notEnrolledUser,
      this.mockAdapter
    )

    checkExpectedState(state, this.expectedNonSignedInState)
  })

  it(`Adapter completed level 0`, async () => {
    this.events.push(...[
      {
        id: eventId++,
        type: GrowthEventTypes.ProfilePublished,
        status: GrowthEventStatuses.Logged,
        ethAddress: this.userA,
        createdAt: this.beforeCampaign
      },
      {
        id: eventId++,
        type: GrowthEventTypes.EmailAttestationPublished,
        status: GrowthEventStatuses.Logged,
        ethAddress: this.userA,
        createdAt: this.duringCampaign
      }
    ])

    const state = await campaignToApolloObject(
      this.crules,
      enums.GrowthParticipantAuthenticationStatus.Enrolled,
      this.userA,
      this.mockAdapter
    )

    // Profile and Email status should have changed to Completed.
    this.expectedState.ProfilePublished.status = 'Completed'
    this.expectedState.EmailAttestation.status = 'Completed'
    // All attestations and referral should be Active.
    this.expectedState.PhoneAttestation.status = 'Active'
    this.expectedState.FacebookAttestation.status = 'Active'
    this.expectedState.TwitterAttestation.status = 'Active'
    this.expectedState.KakaoAttestation.status = 'Active'
    this.expectedState.FacebookShare41.status = 'Active'
    this.expectedState.FacebookLike.status = 'Active'
    this.expectedState.TelegramAttestation.status = 'Active'
    this.expectedState.Referral.status = 'Active'
    // These should still be inactive since they depend on attestation to be completed.
    this.expectedState.TwitterFollow.status = 'Inactive'
    this.expectedState.TwitterShare41.status = 'Inactive'
    this.expectedState.TelegramFollow.status = 'Inactive'

    checkExpectedState(state, this.expectedState)
  })

  it(`Attestations completed level 1`, async () => {
    this.events.push(...[
      {
        id: eventId++,
        type: GrowthEventTypes.FacebookAttestationPublished,
        status: GrowthEventStatuses.Logged,
        ethAddress: this.userA,
        createdAt: this.duringCampaign
      },
      {
        id: eventId++,
        type: GrowthEventTypes.KakaoAttestationPublished,
        status: GrowthEventStatuses.Logged,
        ethAddress: this.userA,
        createdAt: this.duringCampaign
      },
      {
        id: eventId++,
        type: GrowthEventTypes.PhoneAttestationPublished,
        status: GrowthEventStatuses.Logged,
        ethAddress: this.userA,
        createdAt: this.duringCampaign
      }
    ])

    const state = await campaignToApolloObject(
      this.crules,
      enums.GrowthParticipantAuthenticationStatus.Enrolled,
      this.userA,
      this.mockAdapter
    )

    // Attestation should be completed.
    this.expectedState.FacebookAttestation.status = 'Completed'
    this.expectedState.FacebookAttestation.rewardEarned = { amount: '0', currency: 'OGN' }

    this.expectedState.KakaoAttestation.status = 'Completed'
    this.expectedState.KakaoAttestation.rewardEarned = { amount: '0', currency: 'OGN' }

    this.expectedState.PhoneAttestation.status = 'Completed'
    this.expectedState.PhoneAttestation.rewardEarned = { amount: '0', currency: 'OGN' }

    checkExpectedState(state, this.expectedState)
  })

  it(`Complete Telegram attestation`, async () => {
    this.events.push(...[
      {
        id: eventId++,
        type: GrowthEventTypes.TelegramAttestationPublished,
        status: GrowthEventStatuses.Logged,
        ethAddress: this.userA,
        createdAt: this.duringCampaign
      }
    ])

    const state = await campaignToApolloObject(
      this.crules,
      enums.GrowthParticipantAuthenticationStatus.Enrolled,
      this.userA,
      this.mockAdapter
    )

    this.expectedState.TelegramAttestation.status = 'Completed'
    this.expectedState.TelegramAttestation.rewardEarned = { amount: '0', currency: 'OGN' }

    // Telegram follow should now get unlocked.
    this.expectedState.TelegramFollow.status = 'Active'

    checkExpectedState(state, this.expectedState)
  })

  it(`Referral`, async () => {
    // Add events from referee B to make it qualify for level 2.
    this.events.push(...[
      {
        id: eventId++,
        type: GrowthEventTypes.ProfilePublished,
        status: GrowthEventStatuses.Logged,
        ethAddress: this.userB,
        createdAt: this.beforeCampaign
      },
      {
        id: eventId++,
        type: GrowthEventTypes.EmailAttestationPublished,
        status: GrowthEventStatuses.Logged,
        ethAddress: this.userB,
        createdAt: this.duringCampaign
      },
      {
        id: eventId++,
        type: GrowthEventTypes.PhoneAttestationPublished,
        status: GrowthEventStatuses.Logged,
        ethAddress: this.userB,
        createdAt: this.beforeCampaign
      },
      {
        id: eventId++,
        type: GrowthEventTypes.FacebookAttestationPublished,
        status: GrowthEventStatuses.Logged,
        ethAddress: this.userB,
        createdAt: this.duringCampaign
      },
      {
        id: eventId++,
        type: GrowthEventTypes.TwitterAttestationPublished,
        status: GrowthEventStatuses.Logged,
        ethAddress: this.userB,
        createdAt: this.duringCampaign
      }
    ])

    const state = await campaignToApolloObject(
      this.crules,
      enums.GrowthParticipantAuthenticationStatus.Enrolled,
      this.userA,
      this.mockAdapter
    )

    // User should earn a referral reward.
    this.expectedState.Referral.rewardEarned = { amount: '0', currency: 'OGN' }

    checkExpectedState(state, this.expectedState)
  })

  it(`It should fail with an invalid additional lock condition`, async () => {
    const mar2020Config = require('../campaigns/mar2020')

    let originalAdditionalLock
    const modifyTwitterShareRule = (modificationCallback) => {
      mar2020Config.levels['1'].rules = mar2020Config
        .levels['1']
        .rules
        .map(rule => {
          if (rule.id === 'TwitterShare41') {
            modificationCallback(rule)
          }
          return rule
        })
    }
    // modify mar2020 config an enter an invalid rule id
    modifyTwitterShareRule(rule => {
      originalAdditionalLock = rule.config.additionalLockConditions
      rule.config.additionalLockConditions = ['InvalidRuleId']
    })

    try {
      createCampaignRules(mar2020Config, this.campaignStart, this.campaignEnd)
      assert(false, 'An exception for an invalid lock condition has not been thrown')
    } catch (e) {
      expect(e.message, 'EXCEPTION The following conditions can not be found among the rules: InvalidRuleId')
    }

    await campaignToApolloObject(
      this.crules,
      enums.GrowthParticipantAuthenticationStatus.Enrolled,
      this.userA,
      this.mockAdapter
    )

    // revert change to the original state
    modifyTwitterShareRule(rule => {
      rule.config.additionalLockConditions = originalAdditionalLock
    })
  })

  it(`It should unlock TwitterShare and TwitterFollow if Twitter attestation is present`, async () => {
    this.events.push(...[
      // twitter attestation published
      {
        id: eventId++,
        type: GrowthEventTypes.TwitterAttestationPublished,
        status: GrowthEventStatuses.Logged,
        ethAddress: this.userA,
        createdAt: this.duringCampaign
      }
    ])

    const state = await campaignToApolloObject(
      this.crules,
      enums.GrowthParticipantAuthenticationStatus.Enrolled,
      this.userA,
      this.mockAdapter
    )

    // Check the user got rewarded for completing the Twitter attestation.
    this.expectedState.TwitterAttestation.status = 'Completed'
    this.expectedState.TwitterAttestation.rewardEarned = { amount: '0', currency: 'OGN' }

    // Check Twitter Share/Follow got unlocked.
    this.expectedState.TwitterShare41.status = 'Active'
    this.expectedState.TwitterFollow.status = 'Active'

    // Find the TwitterShare and Facebook actions and check they include all expected fields.
    for (const action of state.actions) {
      if (action.type === 'TwitterShare') {
        const twitterShareAction = action
        expect(twitterShareAction).to.be.an('object')
        expect(twitterShareAction.content).to.be.an('object')
        expect(twitterShareAction.content.titleKey).to.be.a('string')
        expect(twitterShareAction.content.link).to.be.a('string')
        expect(twitterShareAction.content.id).to.be.a('string')
        expect(twitterShareAction.content.linkKey).to.be.a('string')
        expect(twitterShareAction.content.titleKey).to.be.a('string')
        expect(twitterShareAction.content.post).to.be.an('object')
        expect(twitterShareAction.content.post.tweet).to.be.an('object')
        expect(twitterShareAction.content.post.tweet.default).to.be.a('string')
        expect(twitterShareAction.content.post.tweet.translations).to.be.an('array')
      } else if (action.type === 'FacebookShare') {
        const facebookShareAction = action
        expect(facebookShareAction).to.be.an('object')
        expect(facebookShareAction.content).to.be.an('object')
        expect(facebookShareAction.content.titleKey).to.be.a('string')
        expect(facebookShareAction.content.link).to.be.a('string')
        expect(facebookShareAction.content.id).to.be.a('string')
        expect(facebookShareAction.content.linkKey).to.be.a('string')
        expect(facebookShareAction.content.titleKey).to.be.a('string')
      }
    }

    checkExpectedState(state, this.expectedState)
  })

  it(`It should not reward OGN for content shared on twitter`, async () => {
    this.events.push(...[
      {
        id: eventId++,
        type: GrowthEventTypes.SharedOnTwitter,
        customId: '4c253f061648a01c0c1f3a94757b6b8f', // use bridge/src/utils/webhook-helpers.js:hashContent to get this hash
        data: {
          twitterProfile: {
            verified: false,
            created_at: '2010-01-01',
            followers_count: 26300,
            status: {
              created_at: new Date().toISOString()
            }
          }
        },
        status: GrowthEventStatuses.Logged,
        ethAddress: this.userA,
        createdAt: this.duringCampaign
      }
    ])

    const state = await campaignToApolloObject(
      this.crules,
      enums.GrowthParticipantAuthenticationStatus.Enrolled,
      this.userA,
      this.mockAdapter
    )

    this.expectedState.TwitterShare41.status = 'Completed'
    this.expectedState.TwitterShare41.rewardEarned = { amount: '0', currency: 'OGN' }

    checkExpectedState(state, this.expectedState)
  })

  it(`It should show facebook share completed `, async () => {
    this.events.push(...[
      {
        id: eventId++,
        type: GrowthEventTypes.SharedOnFacebook,
        customId: 'hkb',
        data: null,
        status: GrowthEventStatuses.Logged,
        ethAddress: this.userA,
        createdAt: this.duringCampaign
      }
    ])

    const state = await campaignToApolloObject(
      this.crules,
      enums.GrowthParticipantAuthenticationStatus.Enrolled,
      this.userA,
      this.mockAdapter
    )

    this.expectedState.FacebookShare41.status = 'Completed'
    this.expectedState.FacebookShare41.rewardEarned = { amount: '0', currency: 'OGN' }

    checkExpectedState(state, this.expectedState)
  })

  it(`It should show facebook like completed `, async () => {
    this.events.push(...[
      {
        id: eventId++,
        type: GrowthEventTypes.LikedOnFacebook,
        customId: null,
        data: null,
        status: GrowthEventStatuses.Logged,
        ethAddress: this.userA,
        createdAt: this.duringCampaign
      }
    ])

    const state = await campaignToApolloObject(
      this.crules,
      enums.GrowthParticipantAuthenticationStatus.Enrolled,
      this.userA,
      this.mockAdapter
    )

    this.expectedState.FacebookLike.status = 'Completed'
    this.expectedState.FacebookLike.rewardEarned = { amount: '0', currency: 'OGN' }

    checkExpectedState(state, this.expectedState)
  })

  it(`It should not reward OGN for following on Telegram`, async () => {
    this.events.push(...[
      {
        id: 21,
        type: GrowthEventTypes.FollowedOnTelegram,
        customId: null,
        data: {},
        status: GrowthEventStatuses.Logged,
        ethAddress: this.userA,
        createdAt: this.duringCampaign
      }
    ])

    const state = await campaignToApolloObject(
      this.crules,
      enums.GrowthParticipantAuthenticationStatus.Enrolled,
      this.userA,
      this.mockAdapter
    )

    this.expectedState.TelegramFollow.status = 'Completed'
    this.expectedState.TelegramFollow.rewardEarned = { amount: '0', currency: 'OGN' }

    checkExpectedState(state, this.expectedState)
  })

})
