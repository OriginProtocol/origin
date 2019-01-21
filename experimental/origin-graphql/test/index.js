import assert from 'assert'
import get from 'lodash/get'

import client from '../src/index'
import { setNetwork } from '../src/contracts'

import { mutate } from './_helpers'
import queries from './_queries'
import mutations from './_mutations'

const ZeroAddress = '0x0000000000000000000000000000000000000000'

describe('Marketplace', function() {
  let Admin, Seller, Buyer, Arbitrator
  let OGN, Marketplace

  before(async function() {
    setNetwork('test')
    const res = await client.query({ query: queries.GetNodeAccounts })
    const nodeAccounts = get(res, 'data.web3.nodeAccounts').map(a => a.id)
    ;[Admin, Seller, Buyer, Arbitrator] = nodeAccounts
  })

  it('should allow a token to be deployed', async function() {
    const receipt = await mutate(mutations.DeployToken, {
      type: 'OriginToken',
      name: 'Origin Token',
      symbol: 'OGN',
      decimals: '18',
      supply: '1000000000',
      from: Admin
    })
    OGN = receipt.contractAddress
    assert(OGN)
  })

  it('should allow marketplace to be deployed', async function() {
    const receipt = await mutate(mutations.DeployMarketplace, {
      token: OGN,
      version: '001',
      autoWhitelist: true,
      from: Admin
    })
    Marketplace = receipt.contractAddress
    assert(Marketplace)
  })

  it('should allow a listing to be created', async function() {
    const events = await mutate(mutations.CreateListing, {
      deposit: '0',
      depositManager: Arbitrator,
      from: Seller,
      data: {
        title: 'Test Listing',
        description: 'Test description',
        price: {
          currency: ZeroAddress,
          amount: '0.01'
        },
        category: 'Test category',
        subCategory: 'Test sub-category',
        unitsTotal: 1
      }
    }, true)
    assert(events.ListingCreated)
  })

  it('should allow an offer to be created', async function() {
    const events = await mutate(mutations.MakeOffer, {
      listingID: '999-0-0',
      from: Buyer,
      finalizes: 123,
      affiliate: ZeroAddress,
      commission: '0',
      value: '0.1',
      currency: ZeroAddress,
      arbitrator: Arbitrator,
      quantity: 1
    }, true)
    assert(events.OfferCreated)
  })

  it('should allow an offer to be accepted', async function() {
    const events = await mutate(mutations.AcceptOffer, {
      offerID: '999-0-0-0',
      from: Seller
    }, true)
    assert(events.OfferAccepted)
  })

  it('should allow an offer to be finalized', async function() {
    const events = await mutate(mutations.FinalizeOffer, {
      offerID: '999-0-0-0',
      from: Buyer
    }, true)
    assert(events.OfferFinalized)
  })
})
