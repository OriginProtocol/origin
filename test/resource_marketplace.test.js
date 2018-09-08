import Marketplace from '../src/resources/marketplace.js'
import contractServiceHelper from './helpers/contract-service-helper'
import IpfsService from '../src/services/ipfs-service.js'
import { expect } from 'chai'
import Web3 from 'web3'
import listingValid from './data/listing-valid.json'

class StoreMock {
  constructor() {
    this.storage = {}
  }

  get(key) {
    return this.storage[key]
  }

  set(key, value) {
    this.storage[key] = value
  }
}

describe('Marketplace Resource', function() {
  this.timeout(10000) // default is 2000
  let marketplace

  beforeEach(async () => {
    const provider = new Web3.providers.HttpProvider('http://localhost:8545')
    const web3 = new Web3(provider)
    // const accounts = await web3.eth.getAccounts()
    const contractService = await contractServiceHelper(web3)
    const ipfsService = new IpfsService({
      ipfsDomain: '127.0.0.1',
      ipfsApiPort: '5002',
      ipfsGatewayPort: '8080',
      ipfsGatewayProtocol: 'http'
    })
    const store = new StoreMock()
    marketplace = new Marketplace({
      contractService,
      ipfsService,
      store
    })

    await marketplace.createListing(listingValid)
  })

  describe('getListingsCount', () => {
    it('should return the count of listings', async () => {
      const listingCount = await marketplace.getListingsCount()
      expect(listingCount).to.equal(1)
    })
  })

  describe('getListings', () => {
    it('should return all listings', async () => {
      await marketplace.createListing(listingValid)
      const listings = await marketplace.getListings()
      expect(listings.length).to.equal(2)
      expect(listings).to.include('999-001-0')
      expect(listings).to.include('999-001-1')
    })
  })
})
