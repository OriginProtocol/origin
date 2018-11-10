const chai = require('chai')

const db = require('../src/models')
const { getListingsById } = require('../src/apollo/db')

const expect = chai.expect

describe('getListingsById', () => {
  it(`Should return listings from DB`, async () => {
    const listingId = '1-000-3'
    const data = {
      id: listingId,
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
    await db.Listing.destroy({ where: { id: listingId } })
    await db.Listing.create({
      id: listingId,
      sellerAddress: '0xcd36ae1201144e08b176fd2598e33e0d87f68ec0',
      status: 'active',
      data
    })
    const listings = await getListingsById([listingId])
    expect(listings.length).to.equal(1)
    expect(listings[0].id).to.equal(listingId)
    expect(listings[0].ipfsHash).to.equal(data.ipfs.hash)
    expect(listings[0].title).to.equal(data.title)
    expect(listings[0].description).to.equal(data.description)
    expect(listings[0].category).to.equal(data.category)
    expect(listings[0].price).to.deep.equal(data.price)
    expect(listings[0].data).to.deep.equal(data)
  })

  it(`Should return no listings from DB`, async () => {
    const listings = await getListingsById(['listingIdNotInDB'])
    expect(listings.length).to.equal(0)
  })
})
