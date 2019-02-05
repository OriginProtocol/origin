const chai = require('chai')
const sinon = require('sinon')

const expect = chai.expect

const { GrowthEvent } = require('origin-growth/src/resources/event')
const { GrowthEventTypes } = require('origin-growth/src/enums')

const db = require('../src/models')
const { handleLog } = require('../src/listener/handler')
const MarketplaceEventHandler = require('../src/listener/handler_marketplace')
const IdentityEventHandler = require('../src/listener/handler_identity')


describe('Listener Handlers', () => {

  class MockWeb3Eth {
    constructor() {
      this.getBlock = () => { return { timestamp: 1 } }
      this.abi = {}
      this.abi.decodeLog = () => { return {} }
    }
  }

  class MockOrigin {
    constructor() {
      this.marketplace = {}
      this.marketplace.getListing = sinon.fake.returns({
        id: '123',
        status: 'active',
        seller: '0xABC',
        events: [ { blockNumber: 1, logIndex: 1 } ]
      })
      this.marketplace.getOffer = sinon.fake.returns({
        id: '123-1',
        status: 'finalized',
        buyer: '0xDEF',
        events: [{ blockNumber: 2, logIndex: 2 }]
      })
      const fakeUser = {
        address: '0x789',
        profile: { firstName: 'foo', lastName: 'bar', avatar: '0xABCDEF' },
        attestations: [ { topic: 'email' }, { topic: 'phone' } ]
      }
      this.users = {}
      this.users.get = sinon.fake.returns(fakeUser)
    }
  }

  class MockHandler {
    constructor() {
      this.process = sinon.fake.returns({})
      this.webhookEnabled = sinon.fake.returns(false)
      this.discordWebhookEnabled = sinon.fake.returns(false)
    }
  }

  before(() => {
    this.config = {
      db: true,
      growth: true
    }

    this.context = {
      web3: {},
      networkId: 999,
      origin: new MockOrigin(),
      config: this.config
    }
    this.context.web3.eth = new MockWeb3Eth()

    // Marketplace test fixtures.
    this.marketplaceRule = {
      eventName: 'OfferFinalized',
      eventAbi: {},
      handler: new MockHandler()
    }
    this.marketplaceRule.eventAbi.inputs = null

    this.marketplaceContractVersion = {
      contractName: 'Marketplace',
      versionKey: '000'
    }

    this.marketplaceLog = {
      address: '0x123',
      contractName: this.marketplaceContractVersion.contractName,
      eventName: this.marketplaceRule.eventName,
      contractVersionKey: this.marketplaceContractVersion.versionKey,
      networkId: context.networkId,
      blockNumber: 1,
      logIndex: 1,
      transactionHash: 'testTxnHash',
      transactionIndex: 1,
      topics: ['topic0', 'topic1', 'topic2', 'topic3'],
    }

    // Identity test fixtures.
    this.identityRule = {
      eventName: 'IdentityUpdated',
      eventAbi: {},
      handler: new MockHandler()
    }
    this.identityRule.eventAbi.inputs = null

    this.identityContractVersion = {
      contractName: 'Identity',
      versionKey: '000'
    }

    this.identityLog = {
      address: '0x123',
      decoded: { account: '0xAAA' },
      contractName: this.identityContractVersion.contractName,
      eventName: this.identityRule.eventName,
      contractVersionKey: this.identityContractVersion.versionKey,
      networkId: context.networkId,
      blockNumber: 1,
      logIndex: 1,
      transactionHash: 'testTxnHash',
      transactionIndex: 1,
      topics: ['topic0', 'topic1', 'topic2', 'topic3'],
    }
  })

  it(`Main`, async () => {
    await handleLog(
      this.marketplaceLog,
      this.marketplaceRule,
      this.marketplaceContractVersion,
      this.context
    )
    expect(this.marketplaceRule.handler.process.calledOnce).to.equal(true)
    expect(this.marketplaceRule.handler.webhookEnabled.calledOnce).to.equal(true)
    expect(this.marketplaceRule.handler.discordWebhookEnabled.calledOnce).to.equal(true)
  })

  it(`Marketplace`, async () => {
    const handler = new MarketplaceEventHandler()
    const result = await handler.process(this.marketplaceLog, this.context)

    // Check output.
    expect(result.listing).to.be.an('object')
    expect(result.listing.id).to.equal('123')
    expect(result.offer).to.be.an('object')
    expect(result.offer.id).to.equal('123-1')

    // Check expected rows were inserted in the DB.
    const listing = await db.Listing.findAll({ where: { id: '123', blockNumber: 1, logIndex: 1, sellerAddress: '0xabc' } })
    expect(listing.length).to.equal(1)
    const offer = await db.Offer.findAll({ where: { id: '123-1', listingId: '123', status: 'finalized', sellerAddress: '0xabc', buyerAddress: '0xdef' } })
    expect(offer.length).to.equal(1)
    const listingEvent = await GrowthEvent.findAll(null, '0xdef', GrowthEventTypes.ListingPurchased, '123-1')
    expect(listingEvent.length).to.equal(1)
  })

  it(`Identity`, async () => {
    const handler = new IdentityEventHandler()
    const result = await handler.process(this.identityLog, this.context)

    // Check output.
    expect(result.user).to.be.an('object')
    expect(result.user.address).to.equal('0x789')

    // Check expected rows were inserted in the DB.
    const profileEvents = await GrowthEvent.findAll(null, '0x789', GrowthEventTypes.ProfilePublished, null)
    expect(profileEvents.length).to.equal(1)
    const emailEvents = await GrowthEvent.findAll(null, '0x789', GrowthEventTypes.EmailAttestationPublished, null)
    expect(emailEvents.length).to.equal(1)
    const phoneEvents = await GrowthEvent.findAll(null, '0x789', GrowthEventTypes.PhoneAttestationPublished, null)
    expect(phoneEvents.length).to.equal(1)
  })
})
