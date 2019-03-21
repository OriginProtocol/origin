const chai = require('chai')
const expect = chai.expect

const { SdnMatcher } = require('../src/util/sdnMatcher')

describe('SDN matcher', () => {
  before( () => {
    this.matcher = new SdnMatcher()
  })

  it('Database should have thousands of entries', () => {
    expect(Object.keys(this.matcher.lastNames).length > 1000).to.be.true
  })

  it(`Should match`, () => {
    const match = this.matcher.match('RUBENACH ROIG', 'Juan Luis')
    expect(match).to.be.true
  })

  it(`Should not match`, () => {
    const match = this.matcher.match('Macron', 'Emmanuel')
    expect(match).to.be.false
  })
})