const chai = require('chai')

const expect = chai.expect

const { checkFreshness } = require('../src/listener/rules')


describe('checkFreshness', () => {
  it(`Should not throw`, () => {
    const blockInfo = {
      blockNumber: 1,
      logIndex: 1
    }

    let events = [ {blockNumber: 2, logIndex: 1} ]
    expect(() => checkFreshness(events, blockInfo)).to.not.throw()

    events = [ {blockNumber: 1, logIndex: 1} ]
    expect(() => checkFreshness(events, blockInfo)).to.not.throw()
  })

  it(`Should throw`, () => {
    const events = []
    const blockInfo = {
      blockNumber: 1,
      logIndex: 1
    }
    expect(() => checkFreshness(events, blockInfo)).to.throw()
  })
})
