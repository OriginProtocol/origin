const chai = require('chai')
const expect = chai.expect
const scoring = require('../src/lib/scoring')

const standardListing = {
  id: '999-000-5-53',
  media: { url: 'ipfs://QmU2NeZjiJZ7TyFCwqHp2bd7MH1bSyZbSAgGxNSR2iUQ3M' },
  status: 'active'
}

async function scoreListing(modifications) {
  const listing = JSON.parse(JSON.stringify(standardListing))
  for (const k in modifications || {}) {
    listing[k] = modifications[k]
  }
  return await scoring.scoreListing(listing)
}

function itDownranks(message, minDownrank, modifications) {
  return it('downranks ' + message, async () => {
    const { scoreMultiplier } = await scoreListing(modifications)
    expect(scoreMultiplier).to.be.lte(minDownrank)
  })
}

function itUpranks(message, minUprank, modifications) {
  return it('upranks ' + message, async () => {
    const { scoreMultiplier } = await scoreListing(modifications)
    expect(scoreMultiplier).to.be.gte(minUprank)
  })
}

function itPassesThrough(message, modifications) {
  return it('passes through ' + message, async () => {
    const { scoreMultiplier } = await scoreListing(modifications)
    expect(scoreMultiplier).to.equal(1.0)
  })
}

describe('Discovery Scoring', () => {
  describe('Listing Status', () => {
    itPassesThrough('normal listings', {})
    itDownranks('sold listings', 0.5, {
      status: 'sold'
    })
    itDownranks('pending listings', 0.5, {
      status: 'pending'
    })
  })

  describe('Downrank no photos', () => {
    itDownranks('downranks listings with no photos', 0.8, {
      media: []
    })
  })

  describe('Downrank cheap', () => {
    itPassesThrough('normal USD', {
      price: { amount: 50, currency: { id: 'fiat-USD' } }
    })
    itDownranks('cheap USD', 0.3, {
      price: { amount: 0.001, currency: { id: 'fiat-USD' } }
    })
    itDownranks('cheap EUR', 0.3, {
      price: { amount: 0.001, currency: { id: 'fiat-EUR' } }
    })
    itDownranks('cheap DAI', 0.3, {
      price: { amount: 0.001, currency: { id: 'token-DAI' } }
    })
    itDownranks('cheap ETH', 0.3, {
      price: { amount: 0.001, currency: { id: 'token-ETH' } }
    })
  })

  describe('Boost with Origin', () => {
    itUpranks('a 50 OGN boost', 2.25, {
      deposit: '50000000000000000000',
      depositAvailable: '50000000000000000000',
      commissionPerUnit: '50000000000000000000'
    })
    itUpranks('a 100 OGN boost', 3.5, {
      deposit: '100000000000000000000',
      depositAvailable: '100000000000000000000',
      commissionPerUnit: '100000000000000000000'
    })
  })
})
