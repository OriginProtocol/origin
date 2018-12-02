const chai = require('chai')

const db = require('../origin-discovery/src/models')

describe('initial state', () => {

  it('should have 5 listings', () => {
  })

  it('should have 5 listings in postgresql', async () => {
    const count = await db.Listing.findAll()

    console.log(count)
  })

  it('should return 5 listings from discovery', () => {
  })

})
