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
  let marketplace, web3

  beforeEach(async () => {
    const provider = new Web3.providers.HttpProvider('http://localhost:8545')
    web3 = new Web3(provider)
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
    await marketplace.makeOffer('999-001-0', { price: 0.1 })
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

  describe('getListing', () => {
    it('should return details of a listing', async () => {
      const listings = await marketplace.getListings()
      expect(listings.length).to.equal(1)
      const listing = await marketplace.getListing(listings[0])
      expect(listing.type).to.equal('unit')
      expect(listing.title).to.equal('my listing')
      expect(listing.description).to.equal('my description')
    })
  })

  describe('createListing', () => {
    it('should create a listing', async () => {
      let listings = await marketplace.getListings()
      expect(listings.length).to.equal(1)
      await marketplace.createListing(listingValid)
      listings = await marketplace.getListings()
      expect(listings.length).to.equal(2)
    })
  })

  // TODO: either don't return withdrawn listings, or have some property that indicates withdraws status
  describe.skip('withdrawListing', () => {
    it('should delete a listing', async () => {
      let listings = await marketplace.getListings()
      expect(listings.length).to.equal(1)
      await marketplace.withdrawListing(listings[0], {})
      listings = await marketplace.getListings()
      expect(listings.length).to.equal(0)
    })
  })

  describe('getOffers: idsOnly=true', () => {
    it('should get offer ids', async () => {
      await marketplace.makeOffer('999-001-0', { price: 0.01 })
      const offers = await marketplace.getOffers('999-001-0', { idsOnly: true })
      expect(offers.length).to.equal(2)
      expect(offers[0]).to.equal('999-001-0-0')
      expect(offers[1]).to.equal('999-001-0-1')
    })
  })

  describe('getOffers', () => {
    it('should get offers with data', async () => {
      await marketplace.makeOffer('999-001-0', { price: 0.01 })
      const offers = await marketplace.getOffers('999-001-0')
      expect(offers.length).to.equal(2)
      expect(offers[0].status).to.equal('created')
      expect(offers[0].ipfsHash).to.exist
      expect(offers[1].status).to.equal('created')
      expect(offers[1].ipfsHash).to.exist
    })
  })

  describe('getOffer', () => {
    it('should get offer data', async () => {
      const offer = await marketplace.getOffer('999-001-0-0')
      expect(offer.status).to.equal('created')
      expect(offer.ipfsHash).to.exist
    })
  })

  describe('makeOffer', () => {
    it('should make an offer', async () => {
      await marketplace.makeOffer('999-001-0', { price: 0.02 })
      const offer = await marketplace.getOffer('999-001-0-1')
      const expectedPrice = web3.utils.toWei(String(0.02), 'ether')
      expect(offer.value).to.equal(expectedPrice)
    })
  })

  describe('acceptOffer', () => {
    it('should changed the status to accepted', async () => {
      let offer = await marketplace.getOffer('999-001-0-0')
      expect(offer.status).to.equal('created')
      await marketplace.acceptOffer('999-001-0-0')
      offer = await marketplace.getOffer('999-001-0-0')
      expect(offer.status).to.equal('accepted')
    })
  })

  describe('finalizeOffer', () => {
    it('should changed the status to finalized', async () => {
      let offer = await marketplace.getOffer('999-001-0-0')
      expect(offer.status).to.equal('created')
      await marketplace.acceptOffer('999-001-0-0')
      await marketplace.finalizeOffer('999-001-0-0')
      offer = await marketplace.getOffer('999-001-0-0')
      expect(offer.status).to.equal('finalized')
    })
  })
})
