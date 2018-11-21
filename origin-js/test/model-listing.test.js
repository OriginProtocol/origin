import chai from 'chai'

import { Listing } from '../src/models/listing'

const expect = chai.expect

describe('Listing', () => {
  it(`unitsRemaining should equal to unitsTotal when no offer`, () => {
    const chainListing = { offers: [] }
    const ipfsListing = { unitsTotal: 10 }
    const listing = Listing.init('FakeID', chainListing, ipfsListing)
    expect(listing.unitsRemaining).to.equal(10)
    expect(listing.unitsSold).to.equal(0)
  })

  it(`unitsRemaining should be unitsTotal - unitsSold`, () => {
    const chainListing = {
      offers: {
        offerId1: { status: 'created' },
        offerId2: { status: 'accepted' }
      }
    }
    const ipfsListing = { unitsTotal: 10 }
    const listing = Listing.init('FakeID', chainListing, ipfsListing)
    expect(listing.unitsRemaining).to.equal(9)
    expect(listing.unitsSold).to.equal(1)
  })
})
