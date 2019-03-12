const chai = require('chai')
const sinon = require('sinon')

const expect = chai.expect

const { GrowthEvent } = require('origin-growth/src/resources/event')
const { GrowthEventTypes } = require('origin-growth/src/enums')

const _discoveryModels = require('../src/models')
const _identityModels = require('origin-identity/src/models')
const db = { ..._discoveryModels, ..._identityModels }

const { handleLog } = require('../src/listener/handler')
const {
  MarketplaceEventHandler
} = require('../src/listener/handler_marketplace')
const IdentityEventHandler = require('../src/listener/handler_identity')

describe('Listener Handlers', () => {
  class MockWeb3Eth {
    constructor(decoded) {
      this.getBlock = () => {
        return { timestamp: 1 }
      }
      this.abi = {}
      this.abi.decodeLog = () => {
        return decoded
      }
    }
  }

  class MockOrigin {
    constructor(seller, buyer, listingId, offerId) {
      this.marketplace = {}
      this.marketplace.getListing = sinon.fake.returns({
        id: listingId,
        status: 'active',
        seller: seller,
        events: [{ blockNumber: 1, logIndex: 1 }]
      })
      this.marketplace.getOffer = sinon.fake.returns({
        id: offerId,
        status: 'finalized',
        buyer: buyer,
        events: [{ blockNumber: 2, logIndex: 2 }]
      })
      const fakeUser = {
        address: seller,
        profile: { firstName: 'foo', lastName: 'bar', avatar: '0xABCDEF' },
        attestations: [{ service: 'email' }, { service: 'phone' }]
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
      this.emailWebhookEnabled = sinon.fake.returns(false)
      this.gcloudPubsubEnabled = sinon.fake.returns(false)
    }
  }

  before(() => {
    this.seller = '0x2ae595eddb54f4234b10cd31fc00790e379fc6b1'
    this.buyer = '0x6c6e93874216112ef12a0d04e2679ecc6c3625cc'
    this.listingId = '999-000-240'
    this.offerId = '999-000-240-1'

    this.config = {
      marketplace: true,
      identity: true,
      growth: true
    }

    this.context = {
      web3: {},
      networkId: 999,
      config: this.config,
      origin: new MockOrigin(
        this.seller,
        this.buyer,
        this.listingId,
        this.offerId
      )
    }
    this.context.web3.eth = new MockWeb3Eth({
      listingID: this.listingId.split('-')[2]
    })

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
      topics: ['topic0', 'topic1', 'topic2', 'topic3']
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
      address: this.seller,
      decoded: {
        account: this.seller,
        ipfsHash:
          '0xaa492b632a1435f500be37bd7e123f9c82e6aa28b385ed05b45bbe4a12c6f18c'
      },
      contractName: this.identityContractVersion.contractName,
      eventName: this.identityRule.eventName,
      contractVersionKey: this.identityContractVersion.versionKey,
      networkId: context.networkId,
      blockNumber: 1,
      logIndex: 1,
      transactionHash: 'testTxnHash',
      transactionIndex: 1,
      topics: ['topic0', 'topic1', 'topic2', 'topic3']
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
    expect(this.marketplaceRule.handler.webhookEnabled.calledOnce).to.equal(
      true
    )
    expect(
      this.marketplaceRule.handler.discordWebhookEnabled.calledOnce
    ).to.equal(true)
    expect(
      this.marketplaceRule.handler.emailWebhookEnabled.calledOnce
    ).to.equal(true)
  })

  it(`Marketplace`, async () => {
    const handler = new MarketplaceEventHandler(
      this.config,
      this.context.origin
    )
    const result = await handler.process(this.marketplaceLog)

    // Check output.
    expect(result.listing).to.be.an('object')
    expect(result.listing.id).to.equal(this.listingId)
    expect(result.offer).to.be.an('object')
    expect(result.offer.id).to.equal(this.offerId)

    // Check expected rows were inserted in the DB.
    const listing = await db.Listing.findAll({
      where: {
        id: this.listingId,
        blockNumber: 1,
        logIndex: 1,
        sellerAddress: this.seller
      }
    })
    expect(listing.length).to.equal(1)
    const offer = await db.Offer.findAll({
      where: {
        id: this.offerId,
        listingId: this.listingId,
        status: 'finalized',
        sellerAddress: this.seller,
        buyerAddress: this.buyer
      }
    })
    expect(offer.length).to.equal(1)
    const listingEvent = await GrowthEvent.findAll(
      null,
      this.buyer,
      GrowthEventTypes.ListingPurchased,
      this.offerId
    )
    expect(listingEvent.length).to.equal(1)
  })

  it(`Identity`, async () => {
    const handler = new IdentityEventHandler(this.config, this.context.origin)
    handler._loadValueFromAttestation = (ethAddress, method) => {
      if (method === 'EMAIL') {
        return 'toto@spirou.com'
      } else if (method === 'PHONE') {
        return '+33 0555875838'
      } else {
        return null
      }
    }

    const result = await handler.process(this.identityLog)

    // Check output.
    expect(result.user).to.be.an('object')
    expect(result.user.address).to.equal(this.seller)

    // Check expected entry was added into user DB table.
    const user = await db.Identity.findAll({
      where: {
        ethAddress: this.seller,
        firstName: 'foo',
        lastName: 'bar',
        email: 'toto@spirou.com',
        phone: '+33 0555875838'
      }
    })
    expect(user.length).to.equal(1)
    expect(user.ipfsHash).to.equal(
      'QmZoNjGgrzMAwVsmNpdStcQDsHCUYcmff8ayVJQhxZ1av7'
    )

    // Check expected growth rows were inserted in the DB.
    const profileEvents = await GrowthEvent.findAll(
      null,
      this.seller,
      GrowthEventTypes.ProfilePublished,
      null
    )
    expect(profileEvents.length).to.equal(1)
    const emailEvents = await GrowthEvent.findAll(
      null,
      this.seller,
      GrowthEventTypes.EmailAttestationPublished,
      null
    )
    expect(emailEvents.length).to.equal(1)
    const phoneEvents = await GrowthEvent.findAll(
      null,
      this.seller,
      GrowthEventTypes.PhoneAttestationPublished,
      null
    )
    expect(phoneEvents.length).to.equal(1)
  })
})
