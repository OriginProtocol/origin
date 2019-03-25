const chai = require('chai')
const sinon = require('sinon')

const expect = chai.expect

const { GrowthEvent } = require('@origin/growth/src/resources/event')
const { GrowthEventTypes } = require('@origin/growth/src/enums')

const _discoveryModels = require('../src/models')
const _identityModels = require('@origin/identity/src/models')
const db = { ..._discoveryModels, ..._identityModels }

const { handleLog } = require('../src/listener/handler')
const MarketplaceEventHandler = require('../src/listener/handler_marketplace')
const IdentityEventHandler = require('../src/listener/handler_identity')

const esmImport = require('esm')(module)
const contractsContext = esmImport('@origin/graphql/src/contracts').default
const graphqlClient = esmImport('@origin/graphql').default

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

  class MockEventSourcer {
    constructor(seller, buyer, listingId, offerId) {
      this.getListing = sinon.fake.returns({
        id: listingId,
        status: 'active',
        seller: {
          id: seller
        },
        events: [{ blockNumber: 1, logIndex: 1 }]
      })

      this.getOffer = sinon.fake.returns({
        id: offerId,
        status: 'finalized',
        buyer: {
          id: buyer
        },
        events: [{ blockNumber: 2, logIndex: 2 }]
      })
    }
  }

  class MockGraphqlClientUserQuery {
    constructor(seller) {
      const identity = {
        address: seller,
        profile: { firstName: 'foo', lastName: 'bar', avatar: '0xABCDEF' },
        attestations: [{ service: 'email' }, { service: 'phone' }],
        avatar: '0x1234'
      }
      return sinon.fake.returns({
        data: {
          web3: {
            account: {
              identity: identity
            }
          }
        }
      })
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

    contractsContext.eventSource = new MockEventSourcer(
      this.seller,
      this.buyer,
      this.listingId,
      this.offerId
    )
    // TODO: replace with something better for mocking response to GraphQL
    // query, this only works because the identity handler only has a single
    // query
    graphqlClient.query = new MockGraphqlClientUserQuery(this.seller)

    this.context = {
      web3: {},
      networkId: 999,
      config: this.config,
      graphqlClient: graphqlClient,
      contracts: contractsContext
    }

    this.context.web3.eth = new MockWeb3Eth({
      listingID: this.listingId.split('-')[2]
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
      address: this.seller,
      decoded: {
        account: this.seller,
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
      this.context.contracts
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
    expect(result.identity.address).to.equal(this.seller)
    expect(result.identity.ipfsHash).to.equal(
      'QmZoNjGgrzMAwVsmNpdStcQDsHCUYcmff8ayVJQhxZ1av7'
    )

    // Check expected entry was added into user DB table.
    const identityRow = await db.Identity.findAll({
      where: {
        ethAddress: this.seller,
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
