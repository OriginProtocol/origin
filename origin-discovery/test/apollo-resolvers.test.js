const chai = require('chai')
const expect = chai.expect

const getResolvers = require('../src/apollo/resolvers')
const ListingMetadata = require('../src/apollo/listing-metadata')

describe('GraphQL resolvers', () => {
  it(`Should export a resolver for each high level type`, () => {
    const resolvers = getResolvers(new ListingMetadata())
    expect(resolvers.JSON).to.be.an('object')
    expect(resolvers.Query).to.be.an('object')
    expect(resolvers.Listing).to.be.an('object')
    expect(resolvers.Offer).to.be.an('object')
    expect(resolvers.User).to.be.an('object')
  })
})
