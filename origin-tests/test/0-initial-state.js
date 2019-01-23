const chai = require('chai')
const assert = chai.assert

const db = require('origin-discovery/src/models')
const Origin = require('origin').default
const Web3 = require('web3')
const web3Provider = new Web3.providers.HttpProvider('http://origin:8545')
const web3 = new Web3(web3Provider)

describe('initial state', () => {

  it('should have 6 listings in postgresql', async () => {
    const count = await db.Listing.findAll()
    assert.equal(count.length, 6)
  })

  it('should return 6 listings in performance mode', async () => {
    const origin = new Origin({
      ipfsDomain: 'origin-ipfs-proxy',
      ipfsGatewayProtocol: 'http',
      ipfsGatewayPort: 9999,
      discoveryServerUrl: 'http://origin-discovery:4000/graphql',
      web3: web3,
      perfModeEnabled: true
    })
    const listings = await origin.marketplace.getListings()
    assert.equal(listings.length, 6)
  })

  it('should return one listing when filtered by marketplacePublisher', async () => {
    const origin = new Origin({
      ipfsDomain: 'origin-ipfs-proxy',
      ipfsGatewayProtocol: 'http',
      ipfsGatewayPort: 9999,
      discoveryServerUrl: 'http://origin-discovery:4000/graphql',
      web3: web3,
      perfModeEnabled: true
    })

    const filters = [{
      name: 'marketplacePublisher',
      value: '0x627306090abaB3A6e1400e9345bC60c78a8BEf57',
      valueType: 'STRING',
      operator: 'EQUALS'
    }]

    const listings = await origin.marketplace.getListings({ filters: filters })
    assert.equal(listings.length, 1)
  })

  it('should return 6 listings', async () => {
    const origin = new Origin({
      ipfsDomain: 'origin-ipfs-proxy',
      ipfsGatewayProtocol: 'http',
      ipfsGatewayPort: 9999,
      web3: web3,
      perfModeEnabled: false
    })
    const listings = await origin.marketplace.getListings()
    assert.equal(listings.length, 6)
  })

})
