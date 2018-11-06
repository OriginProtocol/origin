const chai = require('chai')
const expect = chai.expect

const typeDefs = require('../src/apollo/schema')

describe('GraphQL schema', () => {
  it(`Should export a typedef object`, async () => {
    expect(typeDefs).to.be.an('object')
  })
})
