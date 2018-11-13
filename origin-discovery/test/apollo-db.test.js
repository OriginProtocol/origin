const chai = require('chai')

const db = require('../src/models')
const { getListing, getListingsById, getListingsBySeller } = require('../src/apollo/db')

const expect = chai.expect

describe('Listing DB methods', () => {
  const sellerAddress = '0xabcdef1201144e08b176fd2598e33e0d87f68ec0'
  const listingId1 = '1-000-1'
  const data1 = {
    id: listingId1,
    ipfs: {
      hash: 'QmPvmW469mYPXaBuvbEHB66MY7JAYGPvBncfESMourCKWW'
    },
    title: 'test listing',
    description: 'test description',
    category: 'testCat',
    subCategory: 'testSubCat',
    price: {
      amount: '1.0',
      currency: 'ETH'
    }
  }
  const listingId2 = '1-000-2'
  const data2 = {
    id: listingId2,
    ipfs: {
      hash: 'QmPvmW469mYPXaBuvbEHB66MY7JAYGPvBncfESMourCKWW'
    },
    title: 'test listing',
    description: 'test description',
    category: 'testCat',
    subCategory: 'testSubCat',
    price: {
      amount: '1.0',
      currency: 'ETH'
    }
  }

  before(async () => {
    await db.Listing.destroy({ where: { id: listingId1 } })
    await db.Listing.destroy({ where: { id: listingId2 } })
    await db.Listing.upsert({
      id: listingId1,
      blockNumber: 100,
      logIndex: 1,
      sellerAddress,
      status: 'active',
      data: data1
    })
    await db.Listing.upsert({
      id: listingId2,
      blockNumber: 200,
      logIndex: 2,
      sellerAddress,
      status: 'active',
      data: data2
    })
  })

  after(async () => {
    await db.Listing.destroy({ where: { id: listingId1 } })
    await db.Listing.destroy({ where: { id: listingId2 } })
  })

  describe('getListing', () => {
    it(`Should return listing given an id`, async () => {
      const listing = await getListing(listingId1)
      expect(listing.id).to.equal(listingId1)
      expect(listing.ipfsHash).to.equal(data1.ipfs.hash)
      expect(listing.title).to.equal(data1.title)
      expect(listing.description).to.equal(data1.description)
      expect(listing.category).to.equal(data1.category)
      expect(listing.price).to.deep.equal(data1.price)
      expect(listing.data).to.deep.equal(data1)
      expect(listing.display).to.equal('normal')
      expect(listing.blockNumber).to.equal(100)
      expect(listing.logIndex).to.equal(1)
    })

    it(`Should return listing given an id and a blockInfo`, async () => {
      const blockInfo = { blockNumber: 500, blockIndex: 1 }
      const listing = await getListing(listingId1, blockInfo)
      expect(listing.id).to.equal(listingId1)
    })

    it(`Should not return listing given an id and an invalid blockInfo`, async () => {
      const blockInfo = { blockNumber: 99, blockIndex: 1 }
      const listing = await getListing(listingId1, blockInfo)
      expect(listing).to.equal(null)
    })
  })

  describe('getListingsById', () => {
    it(`Should return listings for the ids`, async () => {
      const listings = await getListingsById([listingId2, listingId1])
      expect(listings.length).to.equal(2)
      expect(listings[0].id).to.equal(listingId2)
      expect(listings[1].id).to.equal(listingId1)
      expect(listings[0].ipfsHash).to.equal(data2.ipfs.hash)
      expect(listings[0].title).to.equal(data2.title)
      expect(listings[0].description).to.equal(data2.description)
      expect(listings[0].category).to.equal(data2.category)
      expect(listings[0].price).to.deep.equal(data2.price)
      expect(listings[0].data).to.deep.equal(data2)
      expect(listings[0].display).to.equal('normal')
      expect(listings[0].blockNumber).to.equal(200)
      expect(listings[0].logIndex).to.equal(2)
    })

    it(`Should return no listings from DB`, async () => {
      const listings = await getListingsById(['listingIdNotInDB'])
      expect(listings.length).to.equal(0)
    })
  })

  describe('getListingsBySeller', () => {
    it(`Should return listings for the seller`, async () => {
      const listings = await getListingsBySeller(sellerAddress)
      expect(listings.length).to.equal(2)
    })
  })

  describe('upsertListing', () => {
    it('Should handle inserting a more recent version of a listing', async () => {
      await db.Listing.upsert({
        id: listingId1,
        blockNumber: 300,
        logIndex: 3,
        sellerAddress,
        status: 'active',
        data: data1
      })
      const listing = await getListing(listingId1)
      expect(listing.blockNumber).to.equal(300)
      expect(listing.logIndex).to.equal(3)
    })

    it('Should handle updating a less recent version of a listing', async () => {
      await db.Listing.upsert({
        id: listingId2,
        blockNumber: 150,
        logIndex: 15,
        sellerAddress,
        status: 'active',
        data: data1
      })
      const listing = await getListing(listingId2)
      expect(listing.blockNumber).to.equal(200)
      expect(listing.logIndex).to.equal(2)
    })
  })
})
