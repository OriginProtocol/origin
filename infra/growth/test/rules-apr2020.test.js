const chai = require('chai')
const expect = chai.expect

const { GrowthEventTypes, GrowthEventStatuses } = require('../src/enums')
const { CampaignRules } = require('../src/resources/rules')


describe('apr2020 campaign rules', () => {

  before(() => {
    const mar2020Config = require('../campaigns/apr2020')

    this.campaignStart = new Date()
    this.campaignEnd = new Date(this.campaignStart.getTime()+100000)
    this.duringCampaign = new Date(this.campaignStart.getTime()+100)
    this.beforeCampaign = new Date(this.campaignStart.getTime()-100000)
    this.afterCampaign = new Date(this.campaignEnd.getTime()+100)

    const row = {
      id: 1,
      rules: JSON.stringify(aor2020Config),
      startDate: this.campaignStart,
      endDate: this.campaignEnd,
      currency: 'OGN'
    }
    this.crules = new CampaignRules(row, apr2020Config)
    expect(this.crules).to.be.an('object')
    expect(this.crules.numLevels).to.equal(3)
    expect(this.crules.levels[0]).to.be.an('object')
    expect(this.crules.levels[0].rules.length).to.equal(3) // Note: adjust based on number of rules.
    expect(this.crules.levels[1]).to.be.an('object')
    expect(this.crules.levels[1].rules.length).to.equal(20) // Note: adjust based on number of rules.

    this.userA = '0x123'
    this.userB = '0x456' // User A is the referrer for user B.
    this.userC = '0x789' // User C has legacy event from prior the start of July campaign.

    this.expectedRewards = []

    // Mock the getEvents method to use events from this.events.
    // When writing a test, be aware that this.events is global and shared with other tests.
    this.events = []
    this.crules.getEvents = (ethAddress) => {
      return this.events
        .filter(event => event.ethAddress === ethAddress)
    }

    // Mock the _getReferees method of the Referral rule.
    this.crules.levels[1].rules[10]._getReferees = () => { return [] }
  })

  it(`Legacy user with profile and email should start at level 1`, async () => {
    this.events = [
      {
        id: 'C1',
        type: GrowthEventTypes.ProfilePublished,
        status: GrowthEventStatuses.Logged,
        ethAddress: this.userC,
        createdAt: this.beforeCampaign
      },
      {
        id: 'C2',
        type: GrowthEventTypes.EmailAttestationPublished,
        status: GrowthEventStatuses.Logged,
        ethAddress: this.userC,
        createdAt: this.beforeCampaign
      }
    ]

    const rewards = await this.crules.getEarnedRewards(this.userC)
    expect(rewards).to.deep.equal([])

    const level = await this.crules.getCurrentLevel(this.userC)
    expect(level).to.equal(1)
  })

  it(`Legacy user with profile, email and 2 attestations should start at level 1`, async () => {
    this.events.push(
      {
        id: 'C3',
        type: GrowthEventTypes.FacebookAttestationPublished,
        status: GrowthEventStatuses.Logged,
        ethAddress: this.userC,
        createdAt: this.beforeCampaign
      },
      {
        id: 'C4',
        type: GrowthEventTypes.PhoneAttestationPublished,
        status: GrowthEventStatuses.Logged,
        ethAddress: this.userC,
        createdAt: this.beforeCampaign
      }
    )

    // User should not be rewarded for those legacy attestations.
    const rewards = await this.crules.getEarnedRewards(this.userC)
    expect(rewards).to.deep.equal([])

    const level = await this.crules.getCurrentLevel(this.userC)
    expect(level).to.equal(1)
  })

  it(`Should start at level 0`, async () => {
    const level = await this.crules.getCurrentLevel(this.userA)
    expect(level).to.equal(0)
  })

  it(`Should graduate to level 1`, async () => {
    this.events.push(
      {
        id: 1,
        type: GrowthEventTypes.ProfilePublished,
        status: GrowthEventStatuses.Logged,
        ethAddress: this.userA,
        createdAt: this.duringCampaign
      },
      {
        id: 2,
        type: GrowthEventTypes.EmailAttestationPublished,
        status: GrowthEventStatuses.Logged,
        ethAddress: this.userA,
        createdAt: this.duringCampaign
      }
    )

    const rewards = await this.crules.getEarnedRewards(this.userA)
    expect(rewards).to.deep.equal([])

    const level = await this.crules.getCurrentLevel(this.userA)
    expect(level).to.equal(1)
  })

  it(`Should not get reward when a referee signs up`, async () => {
    this.crules.levels[1].rules[0]._getReferees = () => { return [this.userB] }
    this.crules.getPriorLevel = () => { return 0 }
    this.events.push(
      {
        id: 3,
        type: GrowthEventTypes.ProfilePublished,
        status: GrowthEventStatuses.Logged,
        ethAddress: this.userB,
        createdAt: this.duringCampaign
      },
      {
        id: 4,
        type: GrowthEventTypes.EmailAttestationPublished,
        status: GrowthEventStatuses.Logged,
        ethAddress: this.userB,
        createdAt: this.duringCampaign
      },
    )

    const rewards = await this.crules.getEarnedRewards(this.userA)
    expect(rewards).to.deep.equal(this.expectedRewards)

    const level = await this.crules.getCurrentLevel(this.userA)
    expect(level).to.equal(1)
  })

})