const chai = require('chai')
const sinon = require('sinon')
const expect = chai.expect
const esmImport = require('esm')(module)

const { GrowthEvent } = require('@origin/growth-event/src/resources/event')
const { GrowthEventTypes } = require('@origin/growth-event/src/enums')

const graphqlClient = esmImport('@origin/graphql').default

const _discoveryModels = require('../src/models')
const _identityModels = require('@origin/identity/src/models')
const db = { ..._discoveryModels, ..._identityModels }
const { handleEvent } = require('../src/listener/handler')
const MarketplaceEventHandler = require('../src/listener/handler_marketplace')
const IdentityEventHandler = require('../src/listener/handler_identity')
const ProxyEventHandler = require('../src/listener/handler_proxy')

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
const mockIpfsIdentity = {
  schemaId: 'https://schema.originprotocol.com/identity_1.0.0.json',
  profile: {
    firstName: 'Origin',
    lastName: 'Protocol',
    description: 'p2p stuff',
    avatarUrl: '',
    schemaId: 'https://schema.originprotocol.com/profile_2.0.0.json',
    ethAddress: seller
  },
  attestations: [
    {
      schemaId: 'https://schema.originprotocol.com/attestation_1.0.0.json',
      data: {
        issuer: {
          name: 'Origin Protocol',
          url: 'https://www.originprotocol.com',
          ethAddress: seller
        },
        issueDate: '2019-07-04T16:39:26.091Z',
        attestation: {
          verificationMethod: {
            email: true
          },
          email: {
            verified: true
          }
        }
      },
      signature: {
        bytes: '0xTestSignature',
        version: '1.0.0'
      }
    },
    {
      schemaId: 'https://schema.originprotocol.com/attestation_1.0.0.json',
      data: {
        issuer: {
          name: 'Origin Protocol',
          url: 'https://www.originprotocol.com',
          ethAddress: seller
        },
        issueDate: '2019-07-04T16:39:26.091Z',
        attestation: {
          verificationMethod: {
            phone: true
          },
          phone: {
            verified: true
          }
        }
      },
      signature: {
        bytes: '0xTestSignature',
        version: '1.0.0'
      }
    }
  ]
}

// Identity data returned by GraphQL.
const mockGraphqldentity = {
  id: seller,
  owner: {
    id: seller
  }
}

const mockOffer = {
  id: offerId,
  statusStr: 'Finalized',
  buyer: {
    id: buyer
  },
  quantity: 2,
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
      .returns(mockGraphqldentity)
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
      proxy: true,
      growth: true,
      networkId: 999
    }

    this.context = {
      web3: {},
      config: this.config,
      graphqlClient: graphqlClient,
      contracts: {
        ipfsGateway: 'testGatewayUrl'
      }
    }

    this.context.web3.eth = new MockWeb3Eth({
      listingID: listingId.split('-')[2],
      offerId: offerId
    })

    this.offerCreatedEvent = {
      id: 'log_e8ed0355',
      event: 'OfferCreated',
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

    this.offerFinalizedEvent = {
      id: 'log_e8ed0356',
      event: 'OfferFinalized',
      address: '0xf3884ecBC6C43383bF7a38c891021380f50AbC49',
      transactionHash: 'testTransactionHash',
      blockNumber: 2,
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
        account: seller,
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

    const handler = await handleEvent(this.offerFinalizedEvent, this.context)
    expect(handler.process.calledOnce).to.equal(true)
    expect(handler.webhookEnabled.calledOnce).to.equal(true)
    expect(handler.discordWebhookEnabled.calledOnce).to.equal(true)
    expect(handler.emailWebhookEnabled.calledOnce).to.equal(true)

    stub.restore()
  })

  it(`Marketplace`, async () => {
    const handler = new MarketplaceEventHandler(
      this.context,
      this.context.graphqlClient
    )

    // Offer must be created before it can be finalized
    await handler.process({ timestamp: 1 }, this.offerCreatedEvent)

    const result = await handler.process(
      { timestamp: 2 },
      this.offerFinalizedEvent
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
    // We expect 2 events since quantity purchased was 2.
    expect(listingEvent.length).to.equal(2)
  })

  it(`Identity`, async () => {
    const handler = new IdentityEventHandler(
      this.context,
      this.context.graphqlClient
    )

    // Mock some methods for testing.
    handler._loadValueFromAttestation = (ethAddress, method) => {
      if (method === 'EMAIL') {
        return 'test@originprotocol.com'
      } else if (method === 'PHONE') {
        return '+00 00000000'
      } else {
        return null
      }
    }
    handler._loadAndValidateIpfsIdentity = () => {
      return mockIpfsIdentity
    }

    const result = await handler.process({ timestamp: 1 }, this.identityEvent)

    // Check output.
    expect(result.identity).to.be.an('object')
    expect(result.identity.ethAddress).to.equal(seller)
    expect(result.identity.data.ipfsHash).to.equal(
      'QmZoNjGgrzMAwVsmNpdStcQDsHCUYcmff8ayVJQhxZ1av7'
    )

    // Check expected entry was added into user DB table.
    const identityRow = await db.Identity.findOne({
      where: {
        ethAddress: seller,
        firstName: 'Origin',
        lastName: 'Protocol'
      }
    })
    expect(identityRow).to.be.an('object')

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

  it(`Proxy`, async () => {
    const handler = new ProxyEventHandler(
      this.config,
      this.context.graphqlClient
    )

    const proxyAddress = '0xAB123'
    const ownerAddress = '0xCD456'
    handler._getProxyOwner = () => {
      return ownerAddress
    }

    const proxyEvent = {
      id: 'log_e8ed0358',
      event: 'ProxyCreation',
      address: proxyAddress,
      transactionHash: 'testTransactionHash',
      blockNumber: 1,
      logIndex: 1,
      returnValues: {
        proxy: proxyAddress
      },
      raw: {
        topics: ['topic0']
      }
    }

    const result = await handler.process({ timestamp: 1 }, proxyEvent)

    // Check output.
    expect(result.proxyAddress).to.equal(proxyEvent.address)
    expect(result.ownerAddress).to.equal(ownerAddress)

    // Check expected entry was added to the proxy DB table.
    const proxyRows = await db.Proxy.findAll({
      where: {
        address: proxyEvent.address.toLowerCase(),
        ownerAddress: ownerAddress.toLowerCase()
      }
    })
    expect(proxyRows.length).to.equal(1)
  })
})
