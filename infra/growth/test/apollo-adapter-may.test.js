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
  expect(state.actions.length).to.equal(14)

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

describe('Apollo adapter - May campaign', () => {
  before(async () => {
    const mayConfig = require('../campaigns/may.js')

    this.campaignStart = new Date()
    this.campaignEnd = new Date(this.campaignStart.getTime()+100000)
    this.duringCampaign = new Date(this.campaignStart.getTime()+100)
    this.beforeCampaign = new Date(this.campaignStart.getTime()-100000)
    const row = {
      id: 1,
      rules: JSON.stringify(mayConfig),
      startDate: this.campaignStart,
      endDate: this.campaignEnd,
      currency: 'OGN'
    }
    this.crules = new CampaignRules(row, mayConfig)
    expect(this.crules).to.be.an('object')
    expect(this.crules.numLevels).to.equal(3)
    expect(this.crules.levels[0]).to.be.an('object')
    expect(this.crules.levels[0].rules.length).to.equal(3)
    expect(this.crules.levels[1]).to.be.an('object')
    expect(this.crules.levels[1].rules.length).to.equal(6)
    expect(this.crules.levels[2]).to.be.an('object')
    expect(this.crules.levels[2].rules.length).to.equal(7)

    // Mock the getEvents method.
    this.crules.getEvents = (ethAddress, opts = {}) => {
      return this.events
        .filter(e => e.ethAddress === ethAddress)
        .filter(e => opts.duringCampaign ? (e.createdAt >= this.campaignStart && e.createdAt <= this.campaignEnd) : true)
        .filter(e => opts.beforeCampaign ? (e.createdAt < this.campaignStart) : true)
    }

    this.userA = '0xA123'
    this.userB = '0xB456'
    this.userC = '0xC789'

    // User A is referrer for user B and C.
    await createReferral(this.userA, this.userB)
    await createReferral(this.userA, this.userC)

    // Mock the adapter's _getReferralActionData to avoid
    // setting up all the DB entries required for method
    // GrowthInvite.getReferralsInfo that it depends on to work in test.
    this.mockAdapter = new ApolloAdapter()
    this.mockAdapter._getReferralsActionData = async () => { return {} }

    this.events = []

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
        reward: { amount: tokenToNaturalUnits(25), currency: 'OGN' }
      },
      AirbnbAttestation: {
        type: 'Airbnb',
        status: 'Inactive',
        rewardEarned: { amount: '0', currency: 'OGN' },
        reward: { amount: tokenToNaturalUnits(25), currency: 'OGN' }
      },
      FacebookAttestation: {
        type: 'Facebook',
        status: 'Inactive',
        rewardEarned: { amount: '0', currency: 'OGN' },
        reward: { amount: tokenToNaturalUnits(25), currency: 'OGN' }
      },
      TwitterAttestation: {
        type: 'Twitter',
        status: 'Inactive',
        rewardEarned: { amount: '0', currency: 'OGN' },
        reward: { amount: tokenToNaturalUnits(25), currency: 'OGN' }
      },
      GoogleAttestation: {
        type: 'Google',
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
      ListingPurchaseTShirt: {
        type: 'ListingIdPurchased',
        status: 'Inactive',
        rewardEarned: { amount: '0', currency: 'OGN' },
        reward: { amount: tokenToNaturalUnits(25), currency: 'OGN' }
      },
      ListingPurchaseGC: {
        type: 'ListingIdPurchased',
        status: 'Inactive',
        rewardEarned: { amount: '0', currency: 'OGN' },
        reward: { amount: tokenToNaturalUnits(40), currency: 'OGN' }
      },
      ListingPurchaseCharity: {
        type: 'ListingIdPurchased',
        status: 'Inactive',
        rewardEarned: { amount: '0', currency: 'OGN' },
        reward: { amount: tokenToNaturalUnits(300), currency: 'OGN' }
      },
      ListingPurchaseHousing: {
        type: 'ListingIdPurchased',
        status: 'Inactive',
        rewardEarned: { amount: '0', currency: 'OGN' },
        reward: { amount: tokenToNaturalUnits(750), currency: 'OGN' }
      },
      ListingPurchaseInfluencer: {
        type: 'ListingIdPurchased',
        status: 'Inactive',
        rewardEarned: { amount: '0', currency: 'OGN' },
        reward: { amount: tokenToNaturalUnits(1250), currency: 'OGN' }
      },
      ListingPurchaseArt: {
        type: 'ListingIdPurchased',
        status: 'Inactive',
        rewardEarned: { amount: '0', currency: 'OGN' },
        reward: { amount: tokenToNaturalUnits(20000), currency: 'OGN' }
      },
    }
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

    checkExpectedState(state, this.expectedState)
  })

  it(`Adapter completed level 1`, async () => {
    this.events.push(...[
      {
        id: 3,
        type: GrowthEventTypes.TwitterAttestationPublished,
        status: GrowthEventStatuses.Logged,
        ethAddress: this.userA,
        createdAt: this.beforeCampaign
      },
      {
        id: 4,
        type: GrowthEventTypes.FacebookAttestationPublished,
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

    this.expectedState.rewardEarned = { amount: '25000000000000000000', currency: 'OGN' }
    // Twitter attestation completed before campaign. Shows as Completed but no rewards.
    this.expectedState.TwitterAttestation.status = 'Completed'
    // User should earn rewards for FBook attestations.
    this.expectedState.FacebookAttestation.status = 'Completed'
    this.expectedState.FacebookAttestation.rewardEarned = { amount: '25000000000000000000', currency: 'OGN' }
    // Level 2 should be unlocked.
    this.expectedState.Referral.status = 'Active'
    this.expectedState.ListingPurchaseTShirt.status = 'Active'
    this.expectedState.ListingPurchaseGC.status = 'Active'
    this.expectedState.ListingPurchaseCharity.status = 'Active'
    this.expectedState.ListingPurchaseHousing.status = 'Active'
    this.expectedState.ListingPurchaseInfluencer.status = 'Active'
    this.expectedState.ListingPurchaseArt.status = 'Active'

    checkExpectedState(state, this.expectedState)
  })

  it(`Adapter at level 2`, async () => {
    this.events.push(...[
      // Listing purchase prior to campaign. Does not qualify for reward.
      {
        id: 5,
        type: GrowthEventTypes.ListingPurchased,
        customId: '1-000-2553-0',
        status: GrowthEventStatuses.Logged,
        ethAddress: this.userA,
        createdAt: this.beforeCampaign
      },
      // Listing purchased during the campaign. Qualifies for reward.
      {
        id: 6,
        type: GrowthEventTypes.ListingPurchased,
        customId: '1-000-2554-0',
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

    this.expectedState.rewardEarned = { amount: '75000000000000000000', currency: 'OGN' }
    // Twitter attestation completed before campaign. Shows as Completed but no rewards.
    this.expectedState.TwitterAttestation.status = 'Completed'
    // User should earn rewards for FBook attestations.
    this.expectedState.AirbnbAttestation.status = 'Completed'
    this.expectedState.AirbnbAttestation.rewardEarned = { amount: '25000000000000000000', currency: 'OGN' }
    // User should earn reward for TShirt purchase. There is no limit so status should still be Active.
    this.expectedState.ListingPurchaseTShirt.rewardEarned = { amount: '25000000000000000000', currency: 'OGN' }

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

    this.expectedState.rewardEarned = { amount: '125000000000000000000', currency: 'OGN' }
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
})