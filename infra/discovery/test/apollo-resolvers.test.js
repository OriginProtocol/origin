const chai = require('chai')
const expect = chai.expect
const { GraphQLScalarType } = require('graphql')

const resolvers = require('../src/apollo/resolvers')

describe('GraphQL resolvers', () => {
  it(`Should export a resolver for each high level type`, () => {
    expect(resolvers.JSON).to.be.instanceOf(GraphQLScalarType)
    expect(resolvers.Query).to.be.an('object')
    expect(resolvers.Listing).to.be.an('object')
    expect(resolvers.Offer).to.be.an('object')
    expect(resolvers.User).to.be.an('object')
  })
})
