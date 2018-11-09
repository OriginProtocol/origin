const chai = require('chai')
const search = require('../src/lib/search.js')
const expect = chai.expect


describe('Search', () => {
  this.hiddenIds = ['999-000-1', '999-000-2'],
  this.featuredIds = ['999-000-4', '999-000-2', '999-000-3']

  // beforeEach(async () => {
        
  // })

  it(`Should generate a query for all listings`, async () => {
    console.error("SEARCH: ", search.client)
    console.error("TESTING1: ", search)
    expect({}).to.be.an('object')
  })
})
