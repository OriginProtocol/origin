const chai = require('chai')
const expect = chai.expect

const resolvers = require('../src/apollo/resolvers')

describe('GraphQL resolvers', () => {
  it(`Should export a resolver for each high level type`, () => {
    //expect(resolvers.JSON).to.be.an('object')
    expect(resolvers.Query).to.be.an('object')
  })
})
