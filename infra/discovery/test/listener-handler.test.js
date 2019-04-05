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
const { handleEvent } = require('../src/listener/handler')
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
  id: seller,
  firstName: 'Origin',
  lastName: 'Protocol',
  avatar: '0xABCDEF',
  attestations: [
    JSON.stringify({
      data: {
        attestation: {
          verificationMethod: {
            email: true
          },
          phone: '+00 00000000'
        }
      }
    }),
    JSON.stringify({
      data: {
        attestation: {
          verificationMethod: {
            phone: true
          },
          email: 'test@originprotocol.com'
        }
      }
    })
  ]
}
const mockOffer = {
  id: offerId,
  statusStr: 'Finalized',
  buyer: {
    id: buyer
  },
  events: [{ blockNumber: 2, logIndex: 2 }]
}

describe('Listener Handlers', () => {
  class MockWeb3Eth {
    constructor() {
      this.getBlock = () => {
        return { timestamp: 1554418195 }
      }
    }
  }

  before(() => {
    sinon
      .stub(IdentityEventHandler.prototype, '_getIdentityDetails')
      .returns(mockIdentity)
    sinon
      .stub(MarketplaceEventHandler.prototype, 'discordWebhookEnabled')
      .returns(false)
    sinon
      .stub(MarketplaceEventHandler.prototype, 'emailWebhookEnabled')
      .returns(false)
    sinon
      .stub(MarketplaceEventHandler.prototype, 'gcloudPubsubEnabled')
      .returns(false)
    sinon
      .stub(MarketplaceEventHandler.prototype, 'webhookEnabled')
      .returns(false)
    sinon
      .stub(MarketplaceEventHandler.prototype, '_getListingDetails')
      .returns({ listing: mockListing })
    sinon.stub(MarketplaceEventHandler.prototype, '_getOfferDetails').returns({
      offer: mockOffer,
      listing: mockListing
    })

    this.config = {
      marketplace: true,
      identity: true,
      growth: true,
      networkId: 999
    }

    this.context = {
      web3: {},
      config: this.config,
      graphqlClient: graphqlClient
    }

    this.context.web3.eth = new MockWeb3Eth({
      listingID: listingId.split('-')[2],
      offerId: offerId
    })

    this.marketplaceEvent = {
      id: 'log_e8ed0356',
      event: 'OfferFinalized',
      address: '0xf3884ecBC6C43383bF7a38c891021380f50AbC49',
      transactionHash: 'testTransactionHash',
      blockNumber: 1,
      logIndex: 1,
      returnValues: {
        party: '123',
        listingID: '240',
        ipfsHash:
          '0x7f154a14b9975c7b2269475892fa3f875dc518b6a3f76259fd29212e956c7f64'
      },
      raw: {
        topics: ['topic0', 'topic1', 'topic2', 'topic3']
      }
    }

    this.identityEvent = {
      id: 'log_e8ed0357',
      event: 'IdentityUpdated',
      address: seller,
      transactionHash: 'testTransactionHash',
      blockNumber: 1,
      logIndex: 1,
      returnValues: {
        address: seller,
        ipfsHash:
          '0xaa492b632a1435f500be37bd7e123f9c82e6aa28b385ed05b45bbe4a12c6f18c'
      },
      raw: {
        topics: ['topic0', 'topic1', 'topic2', 'topic3']
      }
    }
  })

  it(`Main`, async () => {
    const stub = sinon
      .stub(MarketplaceEventHandler.prototype, 'process')
      .returns({})

    const handler = await handleEvent(this.marketplaceEvent, this.context)
    expect(handler.process.calledOnce).to.equal(true)
    expect(handler.webhookEnabled.calledOnce).to.equal(true)
    expect(handler.discordWebhookEnabled.calledOnce).to.equal(true)
    expect(handler.emailWebhookEnabled.calledOnce).to.equal(true)

    stub.restore()
  })

  it(`Marketplace`, async () => {
    const handler = new MarketplaceEventHandler(
      this.config,
      this.context.graphqlClient
    )

    const result = await handler.process(
      { timestamp: 1 },
      this.marketplaceEvent
    )

    // Check output
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
        status: 'Finalized',
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
        return 'test@originprotocol.com'
      } else if (method === 'PHONE') {
        return '+00 00000000'
      } else {
        return null
      }
    }

    const result = await handler.process({ timestamp: 1 }, this.identityEvent)

    // Check output.
    expect(result.identity).to.be.an('object')
    expect(result.identity.id).to.equal(seller)
    expect(result.identity.ipfsHash).to.equal(
      'QmZoNjGgrzMAwVsmNpdStcQDsHCUYcmff8ayVJQhxZ1av7'
    )

    // Check expected entry was added into user DB table.
    const identityRow = await db.Identity.findAll({
      where: {
        ethAddress: seller,
        firstName: 'Origin',
        lastName: 'Protocol',
        email: 'test@originprotocol.com',
        phone: '+00 00000000'
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
