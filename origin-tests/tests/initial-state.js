const chai = require('chai')
const assert = chai.assert

const db = require('../origin-discovery/src/models')
const Origin = require('origin')
const Web3 = require('web3')
const web3Provider = new Web3.providers.HttpProvider('http://origin:8545')
const web3 = new Web3(web3Provider)

describe('initial state', () => {

  it('should have 5 listings in postgresql', async () => {
    const count = await db.Listing.findAll()
    assert.equal(count.length, 5)
  })

  it('should return 5 listings', async () => {
    const origin = new Origin({
      ipfsDomain: 'localhost',
      ipfsGatewayProtocol: 'http',
      ipfsGatewayPort: 9999,
      web3: web3,
      perfModeEnabled: true
    })
    const listings = await origin.marketplace.getListings()
    console.log(listings)
  })

  it('should return 5 listings in performance mode', async () => {
    const origin = new Origin({
      ipfsDomain: 'localhost',
      ipfsGatewayProtocol: 'http',
      ipfsGatewayPort: 9999,
      web3: web3,
      perfModeEnabled: false
    })
    const listings = await origin.marketplace.getListings()
    console.log(listings)
  })

})
