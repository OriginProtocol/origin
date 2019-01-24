import assert from 'assert'
import get from 'lodash/get'

import client from '../src/index'
import contracts, { setNetwork } from '../src/contracts'

import { getOffer, mutate } from './_helpers'
import queries from './_queries'
import mutations from './_mutations'

const ZeroAddress = '0x0000000000000000000000000000000000000000'

describe('Marketplace', function() {
  let Admin, Seller, Buyer, Arbitrator, Affiliate
  let OGN, Marketplace

  before(async function() {
    setNetwork('test')
    const res = await client.query({ query: queries.GetNodeAccounts })
    const nodeAccounts = get(res, 'data.web3.nodeAccounts').map(a => a.id)
    ;[Admin, Seller, Buyer, Arbitrator, Affiliate] = nodeAccounts
  })

  it('should allow a token to be deployed', async function() {
    const receipt = await mutate(mutations.DeployToken, {
      type: 'OriginToken',
      name: 'Origin Token',
      symbol: 'OGN',
      decimals: '18',
      supply: '10000000000000000000000', // 10,000 OGN
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

  it('should allow an affiliate to be added', async function() {
    await mutate(mutations.AddAffiliate, {
      from: Admin,
      affiliate: Affiliate
    })
  })

  describe('Single-unit listing with no commission', function() {
    let listingData

    before(function() {
      listingData = {
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
      }
    })

    it('should allow a listing to be created', async function() {
      const events = await mutate(mutations.CreateListing, listingData, true)
      assert(events.ListingCreated)
    })

    it('should retrieve listing data that matches the provided input', async function() {
      const res = await client.query({
        query: queries.GetListing,
        variables: { id: '999-0-0' }
      })

      const listing = get(res, 'data.marketplace.listing')
      assert.ok(listing)

      assert.strictEqual(listing.deposit, listingData.deposit)
      assert.strictEqual(listing.arbitrator.id, listingData.depositManager)
      assert.strictEqual(listing.seller.id, listingData.from)
      assert.strictEqual(listing.title, listingData.data.title)
      assert.strictEqual(listing.description, listingData.data.description)
      assert.strictEqual(listing.price.amount, listingData.data.price.amount)
      assert.strictEqual(listing.price.currency, listingData.data.price.currency)
      assert.strictEqual(listing.price.amount, listingData.data.price.amount)
      assert.strictEqual(listing.category, listingData.data.category)
      assert.strictEqual(listing.subCategory, listingData.data.subCategory)
      assert.strictEqual(listing.unitsTotal, listingData.data.unitsTotal)
      assert.strictEqual(listing.unitsAvailable, listingData.data.unitsTotal)
      assert.strictEqual(listing.unitsSold, 0)
      assert.strictEqual(listing.commission, '0')
      assert.strictEqual(listing.commissionPerUnit, '0')
      assert.strictEqual(listing.featured, false)
      assert.strictEqual(listing.hidden, false)
    })

    it('should retrieve the listing', async function() {
      const res = await client.query({
        query: queries.GetListing,
        variables: { id: '999-0-0' }
      })

      const id = get(res, 'data.marketplace.listing.id')
      assert.strictEqual(id, '999-0-0')
      // TODO: verify the other listing fields
    })

    it('should retrieve the listing as of a specfic block', async function() {
      const blockNumber = contracts.marketplace.eventCache.getBlockNumber()
      const listingId = `999-0-0-${blockNumber}`
      const res = await client.query({
        query: queries.GetListing,
        variables: { id: listingId }
      })

      const id = get(res, 'data.marketplace.listing.id')
      assert.strictEqual(id, listingId)
      // TODO: verify the other listing fields
    })

    it('should allow an offer to be created', async function() {
      const events = await mutate(mutations.MakeOffer, {
        listingID: '999-0-0',
        from: Buyer,
        finalizes: 123,
        affiliate: ZeroAddress,
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

  describe('Single-unit listing with commission', function() {
    let listingData

    before(async function() {
      listingData = {
        deposit: '1.5',
        depositManager: Arbitrator,
        from: Seller,
        autoApprove: true,
        data: {
          title: 'Test Listing',
          description: 'Test description',
          price: {
            currency: ZeroAddress,
            amount: '0.05'
          },
          category: 'Test category',
          subCategory: 'Test sub-category',
          unitsTotal: 1,
          commission: '1.5'
        }
      }

      // Transfer tokens to the seller to cover the listing deposit.
      await mutate(mutations.TransferToken, {
        token: OGN,
        from: Admin,
        to: Seller,
        value: '1.5'
      })
    })

    it('should allow a listing to be created', async function() {
      await mutate(mutations.CreateListing, listingData)
    })

    it('should retrieve listing data that matches the provided input', async function() {
      const res = await client.query({
        query: queries.GetListing,
        variables: { id: '999-0-1' }
      })

      const listing = get(res, 'data.marketplace.listing')
      assert.ok(listing)

      const web3 = contracts.web3

      assert.strictEqual(listing.id, '999-0-1')
      assert.strictEqual(
        listing.deposit,
        web3.utils.toWei(listingData.deposit, 'ether')
      )
      assert.strictEqual(listing.arbitrator.id, listingData.depositManager)
      assert.strictEqual(listing.seller.id, listingData.from)
      assert.strictEqual(listing.title, listingData.data.title)
      assert.strictEqual(listing.description, listingData.data.description)
      assert.strictEqual(listing.price.amount, listingData.data.price.amount)
      assert.strictEqual(listing.price.currency, listingData.data.price.currency)
      assert.strictEqual(listing.price.amount, listingData.data.price.amount)
      assert.strictEqual(listing.category, listingData.data.category)
      assert.strictEqual(listing.subCategory, listingData.data.subCategory)
      assert.strictEqual(listing.unitsTotal, listingData.data.unitsTotal)
      assert.strictEqual(listing.unitsAvailable, listingData.data.unitsTotal)
      assert.strictEqual(listing.unitsSold, 0)
      assert.strictEqual(listing.commission, '1500000000000000000')
      assert.strictEqual(listing.commissionPerUnit, '1500000000000000000')
      assert.strictEqual(listing.featured, false)
      assert.strictEqual(listing.hidden, false)
    })

    it('should retrieve the listing', async function() {
      const res = await client.query({
        query: queries.GetListing,
        variables: { id: '999-0-1' }
      })

      const id = get(res, 'data.marketplace.listing.id')
      assert.strictEqual(id, '999-0-1')
      // TODO: verify the other listing fields
    })

    it('should allow an offer to be created', async function() {
      const events = await mutate(mutations.MakeOffer, {
        listingID: '999-0-1',
        from: Buyer,
        finalizes: 123,
        affiliate: Affiliate,
        value: '0.1',
        currency: ZeroAddress,
        arbitrator: Arbitrator,
        quantity: 1
      }, true)
      assert(events.OfferCreated)
    })

    it('should allow an offer to be accepted', async function() {
      const events = await mutate(mutations.AcceptOffer, {
        offerID: '999-0-1-0',
        from: Seller
      }, true)
      assert(events.OfferAccepted)
    })

    it('should allow an offer to be finalized', async function() {
      await mutate(mutations.FinalizeOffer, {
        offerID: '999-0-1-0',
        from: Buyer
      })
    })
  })

  describe('Multi-unit listing with commission', async function() {
    before(async function() {
      await mutate(mutations.TransferToken, {
        token: OGN,
        from: Admin,
        to: Seller,
        value: '3'
      })
      // Setting the 'getEvents' parameter to true causes an error.
    })

    it('should allow a listing to be created', async function() {
      await mutate(mutations.CreateListing, {
        deposit: '3',
        depositManager: Arbitrator,
        from: Seller,
        autoApprove: true,
        data: {
          title: 'Multi-unit listing',
          description: 'Test description',
          price: {
            currency: ZeroAddress,
            amount: '0.01'
          },
          category: 'Test category',
          subCategory: 'Test sub-category',
          unitsTotal: 4,
          commission: '3',
          commissionPerUnit: '2'
        }
      })
    })

    it('should allow an offer to be created', async function() {
      const events = await mutate(mutations.MakeOffer, {
        listingID: '999-0-2',
        from: Buyer,
        finalizes: 123,
        affiliate: Affiliate,
        value: '0.01',
        currency: ZeroAddress,
        arbitrator: Arbitrator,
        quantity: 1
      }, true)
      assert(events.OfferCreated)

      const offer = await getOffer('999-0-2', 0)
      assert(offer.status === 1)
      assert(offer.commission === '2000000000000000000')
    })

    it('should allow an offer with partial commission', async function() {
      const events = await mutate(mutations.MakeOffer, {
        listingID: '999-0-2',
        from: Buyer,
        finalizes: 123,
        affiliate: Affiliate,
        value: '0.01',
        currency: ZeroAddress,
        arbitrator: Arbitrator,
        quantity: 1
      }, true)
      assert(events.OfferCreated)

      const offer = await getOffer('999-0-2', 1)
      assert.strictEqual(offer.status, 1)
      assert.strictEqual(offer.commission, '1000000000000000000')
    })

    // TODO: enable this after fixing unit accounting
    it('should accept second offer with partial commission', async function() {
      const events = await mutate(mutations.AcceptOffer, {
        offerID: '999-0-2-1',
        from: Seller
      }, true)
      assert(events.OfferAccepted)

      const offer = await getOffer('999-0-2', 1)
      assert.strictEqual(offer.status, 2)
    })

    it('should count units sold and available', async function() {
      const res = await client.query({
        query: queries.GetListing,
        variables: { id: '999-0-2' }
      })

      const unitsSold = get(res, 'data.marketplace.listing.unitsSold')
      assert.strictEqual(unitsSold, 2)
      const unitsAvailable = get(res, 'data.marketplace.listing.unitsAvailable')
      assert.strictEqual(unitsAvailable, 2)
    })

    it('should allow a multi-unit offer with no commission', async function() {
      const events = await mutate(mutations.MakeOffer, {
        listingID: '999-0-2',
        from: Buyer,
        finalizes: 123,
        affiliate: Affiliate,
        value: '0.02',
        currency: ZeroAddress,
        arbitrator: Arbitrator,
        quantity: 2
      }, true)
      assert(events.OfferCreated)

      const offer = await getOffer('999-0-2', 2)
      assert.strictEqual(offer.status, 1)
      assert.strictEqual(offer.commission, '0')
    })

    it('should count units sold and available', async function() {
      const res = await client.query({
        query: queries.GetListing,
        variables: { id: '999-0-2' }
      })

      const unitsSold = get(res, 'data.marketplace.listing.unitsSold')
      assert.strictEqual(unitsSold, 4)
      const unitsAvailable = get(res, 'data.marketplace.listing.unitsAvailable')
      assert.strictEqual(unitsAvailable, 0)
    })

    it('should withdraw first offer', async function() {
      const events = await mutate(mutations.WithdrawOffer, {
        offerID: '999-0-2-0',
        from: Buyer
      }, true)
      assert(events.OfferWithdrawn)
    })

    it('should not count withdrawn offer as units sold', async function() {
      const res = await client.query({
        query: queries.GetListing,
        variables: { id: '999-0-2' }
      })

      const unitsSold = get(res, 'data.marketplace.listing.unitsSold')
      assert.strictEqual(unitsSold, 3)
      const unitsAvailable = get(res, 'data.marketplace.listing.unitsAvailable')
      assert.strictEqual(unitsAvailable, 1)
    })

    it('should decline third offer', async function() {
      // "Decline offer" means seller withdraws offer
      const events = await mutate(mutations.WithdrawOffer, {
        offerID: '999-0-2-2',
        from: Seller
      }, true)
      assert(events.OfferWithdrawn)
    })

    it('should not count declined offer as units sold', async function() {
      const res = await client.query({
        query: queries.GetListing,
        variables: { id: '999-0-2' }
      })

      const unitsSold = get(res, 'data.marketplace.listing.unitsSold')
      assert.strictEqual(unitsSold, 1)
      const unitsAvailable = get(res, 'data.marketplace.listing.unitsAvailable')
      assert.strictEqual(unitsAvailable, 3)
    })

    it('should finalize the second offer', async function() {
      it('should allow an offer to be finalized', async function() {
        const events = await mutate(mutations.FinalizeOffer, {
          offerID: '999-0-2-1',
          from: Buyer
        }, true)
        assert(events.OfferFinalized)
      })
    })

    it('should count units sold and available', async function() {
      const res = await client.query({
        query: queries.GetListing,
        variables: { id: '999-0-2' }
      })

      const unitsSold = get(res, 'data.marketplace.listing.unitsSold')
      assert.strictEqual(unitsSold, 1)
      const unitsAvailable = get(res, 'data.marketplace.listing.unitsAvailable')
      assert.strictEqual(unitsAvailable, 3)
    })
  })
})
