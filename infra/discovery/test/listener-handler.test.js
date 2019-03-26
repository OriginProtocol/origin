const chai = require('chai')
const sinon = require('sinon')
const expect = chai.expect
const esmImport = require('esm')(module)

const { GrowthEvent } = require('@origin/growth/src/resources/event')
const { GrowthEventTypes } = require('@origin/growth/src/enums')

const _identityModels = require('@origin/identity/src/models')
const graphqlClient = esmImport('@origin/graphql').default

const _discoveryModels = require('../src/models')
const db = { ..._discoveryModels, ..._identityModels }
const { handleLog } = require('../src/listener/handler')
const MarketplaceEventHandler = require('../src/listener/handler_marketplace')
const IdentityEventHandler = require('../src/listener/handler_identity')

const seller = '0x2ae595eddb54f4234b10cd31fc00790e379fc6b1'
const buyer = '0x6c6e93874216112ef12a0d04e2679ecc6c3625cc'
const listingId = '999-000-240'
const offerId = '999-000-240-1'
const mockListing = {
  id: listingId,
  status: 'active',
  seller: {
    id: seller
  }
}
const mockIdentity = {
  address: seller,
  profile: { firstName: 'foo', lastName: 'bar', avatar: '0xABCDEF' },
  attestations: [{ service: 'email' }, { service: 'phone' }],
  avatar: '0x1234'
}
const mockOffer = {
  id: offerId,
  status: 'finalized',
  buyer: {
    id: buyer
  },
  events: [{ blockNumber: 2, logIndex: 2 }]
}

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
    sinon.stub(IdentityEventHandler.prototype, '_getIdentityDetails').returns(mockIdentity)
    sinon.stub(MarketplaceEventHandler.prototype, 'discordWebhookEnabled').returns(false)
    sinon.stub(MarketplaceEventHandler.prototype, 'emailWebhookEnabled').returns(false)
    sinon.stub(MarketplaceEventHandler.prototype, 'gcloudPubsubEnabled').returns(false)
    sinon.stub(MarketplaceEventHandler.prototype, 'webhookEnabled').returns(false)
    sinon.stub(MarketplaceEventHandler.prototype, '_getListingDetails').returns({ listing: mockListing })
    sinon.stub(MarketplaceEventHandler.prototype, '_getOfferDetails').returns({
      offer: mockOffer,
      listing: mockListing
    })

    this.config = {
      marketplace: true,
      identity: true,
      growth: true
    }

    this.context = {
      web3: {},
      networkId: 999,
      config: this.config,
      graphqlClient: graphqlClient
    }

    this.context.web3.eth = new MockWeb3Eth({
      listingID: listingId.split('-')[2],
      offerId: offerId
    })

    // Marketplace test fixtures.
    this.marketplaceRule = {
      eventName: 'OfferFinalized',
      eventAbi: {
        inputs: null
      },
      handler: new MockHandler()
    }

    this.marketplaceLog = {
      address: '0x123',
      contractName: 'MarketplaceContract',
      eventName: this.marketplaceRule.eventName,
      networkId: context.networkId,
      blockNumber: 1,
      logIndex: 1,
      transactionHash: 'testTxnHash',
      transactionIndex: 1,
      topics: ['topic0', 'topic1', 'topic2', 'topic3'],
      date: new Date()
    }

    // Identity test fixtures.
    this.identityRule = {
      eventName: 'IdentityUpdated',
      eventAbi: {
        inputs: null
      },
      handler: new MockHandler()
    }

    this.identityLog = {
      address: seller,
      decoded: {
        account: seller,
        ipfsHash:
          '0xaa492b632a1435f500be37bd7e123f9c82e6aa28b385ed05b45bbe4a12c6f18c'
      },
      contractName: 'IdentityEventsContract',
      eventName: this.identityRule.eventName,
      networkId: context.networkId,
      blockNumber: 1,
      logIndex: 1,
      transactionHash: 'testTxnHash',
      transactionIndex: 1,
      topics: ['topic0', 'topic1', 'topic2', 'topic3'],
      date: new Date()
    }
  })

  it(`Main`, async () => {
    await handleLog(this.marketplaceLog, this.marketplaceRule, this.context)
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
      this.context.graphqlClient
    )
    const result = await handler.process(this.marketplaceLog)

    // Check output.
    expect(result.listing).to.be.an('object')
    expect(result.listing.id).to.equal(listingId)
    expect(result.offer).to.be.an('object')
    expect(result.offer.id).to.equal(offerId)

    // Check expected rows were inserted in the DB.
    const listing = await db.Listing.findAll({
      where: {
        id: listingId,
        blockNumber: 1,
        logIndex: 1,
        sellerAddress: seller
      }
    })
    expect(listing.length).to.equal(1)

    const offer = await db.Offer.findAll({
      where: {
        id: offerId,
        listingId: listingId,
        status: 'finalized',
        sellerAddress: seller,
        buyerAddress: buyer
      }
    })
    expect(offer.length).to.equal(1)

    const listingEvent = await GrowthEvent.findAll(
      null,
      buyer,
      GrowthEventTypes.ListingPurchased,
      offerId
    )
    expect(listingEvent.length).to.equal(1)
  })

  it(`Identity`, async () => {
    const handler = new IdentityEventHandler(
      this.config,
      this.context.graphqlClient
    )

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
    expect(result.identity).to.be.an('object')
    expect(result.identity.address).to.equal(seller)
    expect(result.identity.ipfsHash).to.equal(
      'QmZoNjGgrzMAwVsmNpdStcQDsHCUYcmff8ayVJQhxZ1av7'
    )

    // Check expected entry was added into user DB table.
    const identityRow = await db.Identity.findAll({
      where: {
        ethAddress: seller,
        firstName: 'foo',
        lastName: 'bar',
        email: 'toto@spirou.com',
        phone: '+33 0555875838'
      }
    })
    expect(identityRow.length).to.equal(1)

    // Check expected growth rows were inserted in the DB.
    const profileEvents = await GrowthEvent.findAll(
      null,
      seller,
      GrowthEventTypes.ProfilePublished,
      null
    )
    expect(profileEvents.length).to.equal(1)
    const emailEvents = await GrowthEvent.findAll(
      null,
      seller,
      GrowthEventTypes.EmailAttestationPublished,
      null
    )
    expect(emailEvents.length).to.equal(1)
    const phoneEvents = await GrowthEvent.findAll(
      null,
      seller,
      GrowthEventTypes.PhoneAttestationPublished,
      null
    )
    expect(phoneEvents.length).to.equal(1)
  })
})
