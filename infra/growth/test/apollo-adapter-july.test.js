const chai = require('chai')
const expect = chai.expect

const { GrowthEventTypes, GrowthEventStatuses } = require('../src/enums')
const { CampaignRules } = require('../src/resources/rules')
const { ApolloAdapter, campaignToApolloObject } = require('../src/apollo/adapter')
const enums = require('../src/enums')
const db = require('../src/models')
const { tokenToNaturalUnits } = require('../src/util/token')

function checkExpectedState(state, expectedState) {
  expect(state.rewardEarned).to.deep.equal(expectedState.rewardEarned)
  expect(state.actions.length).to.equal(27) // TODO: Adjust when adding listings

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
    if (action.type === 'ListingIdPurchased') {
      expect(action.listingId).to.be.a('string')
      expect(action.iconSrc).to.be.a('string')
      expect(action.titleKey).to.be.a('string')
      expect(action.detailsKey).to.be.a('string')
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

describe('Apollo adapter - July campaign', () => {
  before(async () => {
    const juneConfig = require('../campaigns/july')

    this.campaignStart = new Date()
    this.campaignEnd = new Date(this.campaignStart.getTime()+100000)
    this.duringCampaign = new Date(this.campaignStart.getTime()+100)
    this.beforeCampaign = new Date(this.campaignStart.getTime()-100000)
    const row = {
      id: 1,
      rules: JSON.stringify(juneConfig),
      startDate: this.campaignStart,
      endDate: this.campaignEnd,
      currency: 'OGN'
    }
    this.crules = new CampaignRules(row, juneConfig)
    expect(this.crules).to.be.an('object')
    expect(this.crules.numLevels).to.equal(3)
    expect(this.crules.levels[0]).to.be.an('object')
    expect(this.crules.levels[0].rules.length).to.equal(3)
    expect(this.crules.levels[1]).to.be.an('object')
    expect(this.crules.levels[1].rules.length).to.equal(11)
    expect(this.crules.levels[2]).to.be.an('object')
    expect(this.crules.levels[2].rules.length).to.equal(15) // TODO: adjust when adding new listings

    // Mock the getEvents method to use events from this.events.
    // When writing a test, be aware that this.events is global and shared with other tests.
    this.events = []
    this.crules.getEvents = (ethAddress, opts = {}) => {
      return this.events
        .filter(e => e.ethAddress === ethAddress)
        .filter(e => opts.duringCampaign ? (e.createdAt >= this.campaignStart && e.createdAt <= this.campaignEnd) : true)
        .filter(e => opts.beforeCampaign ? (e.createdAt < this.campaignStart) : true)
    }

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
      AirbnbAttestation: {
        type: 'Airbnb',
        status: 'Inactive',
        rewardEarned: { amount: '0', currency: 'OGN' },
        reward: { amount: tokenToNaturalUnits(10), currency: 'OGN' }
      },
      FacebookAttestation: {
        type: 'Facebook',
        status: 'Inactive',
        rewardEarned: { amount: '0', currency: 'OGN' },
        reward: { amount: tokenToNaturalUnits(10), currency: 'OGN' }
      },
      TwitterAttestation: {
        type: 'Twitter',
        status: 'Inactive',
        rewardEarned: { amount: '0', currency: 'OGN' },
        reward: { amount: tokenToNaturalUnits(10), currency: 'OGN' }
      },
      GoogleAttestation: {
        type: 'Google',
        status: 'Inactive',
        rewardEarned: { amount: '0', currency: 'OGN' },
        reward: { amount: tokenToNaturalUnits(10), currency: 'OGN' }
      },
      LinkedInAttestation: {
        type: 'LinkedIn',
        status: 'Inactive',
        rewardEarned: { amount: '0', currency: 'OGN' },
        reward: { amount: tokenToNaturalUnits(25), currency: 'OGN' }
      },
      GitHubAttestation: {
        type: 'GitHub',
        status: 'Inactive',
        rewardEarned: { amount: '0', currency: 'OGN' },
        reward: { amount: tokenToNaturalUnits(25), currency: 'OGN' }
      },
      KakaoAttestation: {
        type: 'Kakao',
        status: 'Inactive',
        rewardEarned: { amount: '0', currency: 'OGN' },
        reward: { amount: tokenToNaturalUnits(25), currency: 'OGN' }
      },
      WeChatAttestation: {
        type: 'WeChat',
        status: 'Inactive',
        rewardEarned: { amount: '0', currency: 'OGN' },
        reward: { amount: tokenToNaturalUnits(25), currency: 'OGN' }
      },
      WebsiteAttestation: {
        type: 'Website',
        status: 'Inactive',
        rewardEarned: { amount: '0', currency: 'OGN' },
        reward: { amount: tokenToNaturalUnits(25), currency: 'OGN' }
      },
      Referral: {
        type: 'Referral',
        status: 'Inactive',
        rewardEarned: { amount: '0', currency: 'OGN' },
        reward: { amount: tokenToNaturalUnits(50), currency: 'OGN' }
      },
      MobileAccountCreated: {
        type: 'MobileAccountCreated',
        status: 'Inactive',
        rewardEarned: { amount: '0', currency: 'OGN' },
        reward: { amount: tokenToNaturalUnits(150), currency: 'OGN' }
      },
      ListingPurchase2867: {
        type: 'ListingIdPurchased',
        status: 'Inactive',
        rewardEarned: { amount: '0', currency: 'OGN' },
        reward: { amount: tokenToNaturalUnits(10), currency: 'OGN' }
      },
      ListingPurchase2865: {
        type: 'ListingIdPurchased',
        status: 'Inactive',
        rewardEarned: { amount: '0', currency: 'OGN' },
        reward: { amount: tokenToNaturalUnits(10), currency: 'OGN' }
      },
      ListingPurchase2866: {
        type: 'ListingIdPurchased',
        status: 'Inactive',
        rewardEarned: { amount: '0', currency: 'OGN' },
        reward: { amount: tokenToNaturalUnits(20), currency: 'OGN' }
      },
      ListingPurchase679: {
        type: 'ListingIdPurchased',
        status: 'Inactive',
        rewardEarned: { amount: '0', currency: 'OGN' },
        reward: { amount: tokenToNaturalUnits(500), currency: 'OGN' }
      },
      ListingPurchase2555: {
        type: 'ListingIdPurchased',
        status: 'Inactive',
        rewardEarned: { amount: '0', currency: 'OGN' },
        reward: { amount: tokenToNaturalUnits(250), currency: 'OGN' }
      },
      ListingPurchase1103: {
        type: 'ListingIdPurchased',
        status: 'Inactive',
        rewardEarned: { amount: '0', currency: 'OGN' },
        reward: { amount: tokenToNaturalUnits(20), currency: 'OGN' }
      },
      ListingPurchase2812: {
        type: 'ListingIdPurchased',
        status: 'Inactive',
        rewardEarned: { amount: '0', currency: 'OGN' },
        reward: { amount: tokenToNaturalUnits(15), currency: 'OGN' }
      },
      ListingPurchase866: {
        type: 'ListingIdPurchased',
        status: 'Inactive',
        rewardEarned: { amount: '0', currency: 'OGN' },
        reward: { amount: tokenToNaturalUnits(15), currency: 'OGN' }
      },
      ListingPurchase297: {
        type: 'ListingIdPurchased',
        status: 'Inactive',
        rewardEarned: { amount: '0', currency: 'OGN' },
        reward: { amount: tokenToNaturalUnits(500), currency: 'OGN' }
      },
      ListingPurchase289: {
        type: 'ListingIdPurchased',
        status: 'Inactive',
        rewardEarned: { amount: '0', currency: 'OGN' },
        reward: { amount: tokenToNaturalUnits(500), currency: 'OGN' }
      },
      ListingPurchase639: {
        type: 'ListingIdPurchased',
        status: 'Inactive',
        rewardEarned: { amount: '0', currency: 'OGN' },
        reward: { amount: tokenToNaturalUnits(20), currency: 'OGN' }
      },
      ListingPurchase471: {
        type: 'ListingIdPurchased',
        status: 'Inactive',
        rewardEarned: { amount: '0', currency: 'OGN' },
        reward: { amount: tokenToNaturalUnits(20), currency: 'OGN' }
      },
      ListingPurchase292: {
        type: 'ListingIdPurchased',
        status: 'Inactive',
        rewardEarned: { amount: '0', currency: 'OGN' },
        reward: { amount: tokenToNaturalUnits(500), currency: 'OGN' }
      }
      // TODO: add more listings
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
        id: 1,
        type: GrowthEventTypes.ProfilePublished,
        status: GrowthEventStatuses.Logged,
        ethAddress: this.userA,
        createdAt: this.beforeCampaign
      },
      {
        id: 2,
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
    // All rules in Level 1 should now be Active.
    this.expectedState.ProfilePublished.status = 'Completed'
    this.expectedState.EmailAttestation.status = 'Completed'
    this.expectedState.PhoneAttestation.status = 'Active'
    this.expectedState.FacebookAttestation.status = 'Active'
    this.expectedState.AirbnbAttestation.status = 'Active'
    this.expectedState.TwitterAttestation.status = 'Active'
    this.expectedState.GoogleAttestation.status = 'Active'
    this.expectedState.GitHubAttestation.status = 'Active'
    this.expectedState.LinkedInAttestation.status = 'Active'
    this.expectedState.KakaoAttestation.status = 'Active'
    this.expectedState.WeChatAttestation.status = 'Active'
    this.expectedState.WebsiteAttestation.status = 'Active'

    checkExpectedState(state, this.expectedState)
  })

  it(`Adapter completed level 1`, async () => {
    this.events.push(...[
      {
        id: 3,
        type: GrowthEventTypes.WeChatAttestationPublished,
        status: GrowthEventStatuses.Logged,
        ethAddress: this.userA,
        createdAt: this.duringCampaign
      },
      {
        id: 4,
        type: GrowthEventTypes.KakaoAttestationPublished,
        status: GrowthEventStatuses.Logged,
        ethAddress: this.userA,
        createdAt: this.duringCampaign
      },
    ])

    const state = await campaignToApolloObject(
      this.crules,
      enums.GrowthParticipantAuthenticationStatus.Enrolled,
      this.userA,
      this.mockAdapter
    )

    this.expectedState.rewardEarned = { amount: '50000000000000000000', currency: 'OGN' }

    // Attestation should be completed.
    this.expectedState.WeChatAttestation.status = 'Completed'
    this.expectedState.WeChatAttestation.rewardEarned = { amount: '25000000000000000000', currency: 'OGN' }

    this.expectedState.KakaoAttestation.status = 'Completed'
    this.expectedState.KakaoAttestation.rewardEarned = { amount: '25000000000000000000', currency: 'OGN' }

    // Level 2 should be unlocked.
    this.expectedState.Referral.status = 'Active'
    this.expectedState.MobileAccountCreated.status = 'Active'
    this.expectedState.ListingPurchase2867.status = 'Active'
    this.expectedState.ListingPurchase2865.status = 'Active'
    this.expectedState.ListingPurchase2866.status = 'Active'
    this.expectedState.ListingPurchase679.status = 'Active'
    this.expectedState.ListingPurchase2555.status = 'Active'
    this.expectedState.ListingPurchase1103.status = 'Active'
    this.expectedState.ListingPurchase2812.status = 'Active'
    this.expectedState.ListingPurchase866.status = 'Active'
    this.expectedState.ListingPurchase297.status = 'Active'
    this.expectedState.ListingPurchase289.status = 'Active'
    this.expectedState.ListingPurchase639.status = 'Active'
    this.expectedState.ListingPurchase471.status = 'Active'
    this.expectedState.ListingPurchase292.status = 'Active'
    // TODO: add more listings.

    checkExpectedState(state, this.expectedState)
  })

  it(`Adapter at level 2`, async () => {
    this.events.push(...[
      // Listing purchase prior to campaign. Does not qualify for reward.
      {
        id: 5,
        type: GrowthEventTypes.ListingPurchased,
        customId: '1-000-2867-0',
        status: GrowthEventStatuses.Logged,
        ethAddress: this.userA,
        createdAt: this.beforeCampaign
      },
      // Listing purchased during the campaign. Qualifies for reward.
      {
        id: 6,
        type: GrowthEventTypes.ListingPurchased,
        customId: '1-000-2865-0',
        status: GrowthEventStatuses.Logged,
        ethAddress: this.userA,
        createdAt: this.duringCampaign
      },
      {
        id: 7,
        type: GrowthEventTypes.AirbnbAttestationPublished,
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

    this.expectedState.rewardEarned = { amount: '70000000000000000000', currency: 'OGN' }
    this.expectedState.AirbnbAttestation.status = 'Completed'
    this.expectedState.AirbnbAttestation.rewardEarned = { amount: '10000000000000000000', currency: 'OGN' }
    // User should earn reward for the purchase. There is no limit so status should still be Active.
    this.expectedState.ListingPurchase2865.rewardEarned = { amount: '10000000000000000000', currency: 'OGN' }

    checkExpectedState(state, this.expectedState)
  })

  it(`Adapter at level 2 with a referral`, async () => {
    // Add events from referee B to make it qualify for level 2.
    this.events.push(...[
      {
        id: 8,
        type: GrowthEventTypes.ProfilePublished,
        status: GrowthEventStatuses.Logged,
        ethAddress: this.userB,
        createdAt: this.beforeCampaign
      },
      {
        id: 9,
        type: GrowthEventTypes.EmailAttestationPublished,
        status: GrowthEventStatuses.Logged,
        ethAddress: this.userB,
        createdAt: this.duringCampaign
      },
      {
        id: 10,
        type: GrowthEventTypes.PhoneAttestationPublished,
        status: GrowthEventStatuses.Logged,
        ethAddress: this.userB,
        createdAt: this.beforeCampaign
      },
      {
        id: 11,
        type: GrowthEventTypes.AirbnbAttestationPublished,
        status: GrowthEventStatuses.Logged,
        ethAddress: this.userB,
        createdAt: this.duringCampaign
      },
    ])

    const state = await campaignToApolloObject(
      this.crules,
      enums.GrowthParticipantAuthenticationStatus.Enrolled,
      this.userA,
      this.mockAdapter
    )

    this.expectedState.rewardEarned = { amount: '120000000000000000000', currency: 'OGN' }
    // User should earn a referral reward.
    this.expectedState.Referral.rewardEarned = { amount: '50000000000000000000', currency: 'OGN' }

    checkExpectedState(state, this.expectedState)
  })

  it(`Adapter at level 2 with a referral from prev campaign`, async () => {
    // Add events from the referee C to make it qualify for level 2 but
    // during previous campaign.
    this.events.push(...[
      {
        id: 12,
        type: GrowthEventTypes.ProfilePublished,
        status: GrowthEventStatuses.Logged,
        ethAddress: this.userC,
        createdAt: this.beforeCampaign
      },
      {
        id: 12,
        type: GrowthEventTypes.EmailAttestationPublished,
        status: GrowthEventStatuses.Logged,
        ethAddress: this.userC,
        createdAt: this.beforeCampaign
      },
      {
        id: 13,
        type: GrowthEventTypes.FacebookAttestationPublished,
        status: GrowthEventStatuses.Logged,
        ethAddress: this.userC,
        createdAt: this.beforeCampaign
      },
      {
        id: 14,
        type: GrowthEventTypes.GoogleAttestationPublished,
        status: GrowthEventStatuses.Logged,
        ethAddress: this.userC,
        createdAt: this.beforeCampaign
      },
    ])

    const state = await campaignToApolloObject(
      this.crules,
      enums.GrowthParticipantAuthenticationStatus.Enrolled,
      this.userA,
      this.mockAdapter
    )

    // State should not have changed since this referral that occurred
    // during previous campaign should have no effect on this campaign.
    checkExpectedState(state, this.expectedState)
  })

  it(`Adapter at level 2 with a mobile install`, async () => {
    this.events.push(
      // Listing purchase prior to campaign. Does not qualify for reward.
      {
        id: 15,
        type: GrowthEventTypes.MobileAccountCreated,
        status: GrowthEventStatuses.Logged,
        ethAddress: this.userA,
        createdAt: this.duringCampaign
      }
    )

    const state = await campaignToApolloObject(
      this.crules,
      enums.GrowthParticipantAuthenticationStatus.Enrolled,
      this.userA,
      this.mockAdapter
    )

    this.expectedState.rewardEarned = { amount: '270000000000000000000', currency: 'OGN' }
    this.expectedState.MobileAccountCreated.status = 'Completed'
    this.expectedState.MobileAccountCreated.rewardEarned = { amount: '150000000000000000000', currency: 'OGN' }

    checkExpectedState(state, this.expectedState)
  })
})