import { expect } from 'chai'
import Listings from '../src/resources/listings.js'
import ContractService from '../src/services/contract-service'
import IpfsService from '../src/services/ipfs-service.js'
import Web3 from 'web3'
import asAccount from './helpers/as-account'
import fetchMock from 'fetch-mock'

describe('Listing Resource', function() {
  this.timeout(5000) // default is 2000

  let listings
  let contractService
  let ipfsService
  let buyer

  before(async () => {
    const provider = new Web3.providers.HttpProvider('http://localhost:8545')
    const web3 = new Web3(provider)
    contractService = new ContractService({ web3 })
    ipfsService = new IpfsService({
      ipfsDomain: '127.0.0.1',
      ipfsApiPort: '5002',
      ipfsGatewayPort: '8080',
      ipfsGatewayProtocol: 'http'
    })
    listings = new Listings({ contractService, ipfsService })
    const accounts = await web3.eth.getAccounts()
    buyer = accounts[1]

    // Ensure that there are at least 2 sample listings
    await listings.create({ name: 'Sample Listing 1', price: 1 }, '')
    await listings.create({ name: 'Sample Listing 2', price: 1 }, '')
  })

  it('should get all listing ids', async () => {
    const ids = await listings.allIds()
    expect(ids.length).to.be.greaterThan(1)
  })

  it('should get all listing addresses', async () => {
    await listings.create({ name: 'Sample Listing 2', price: 2 }, '')
    const addresses = await listings.allAddresses()
    expect(addresses.length).to.be.greaterThan(1)
  })

  it('should get a listing by index', async () => {
    await listings.create({ name: 'Foo Bar', price: 1 }, '')
    const listingIds = await listings.allIds()
    const listing = await listings.getByIndex(listingIds[listingIds.length - 1])
    expect(listing.name).to.equal('Foo Bar')
  })

  it('should get a listing by address', async () => {
    await listings.create({ name: 'Foo Bar', price: 1 }, '')
    const listingIds = await listings.allIds()
    const listingFromIndex = await listings.getByIndex(
      listingIds[listingIds.length - 1]
    )
    const listing = await listings.get(listingFromIndex.address)
    expect(listing.name).to.equal('Foo Bar')
    expect(listing.listingType).to.equal('unit')
  })

  it('should buy a listing', async () => {
    await listings.create({ name: 'My Listing', price: 1 }, '')
    const listingIds = await listings.allIds()
    const listing = await listings.getByIndex(listingIds[listingIds.length - 1])
    await asAccount(contractService.web3, buyer, async () => {
      await listings.buy(listing.address, 1, listing.price * 1)
    })
  })

  it('should create a listing', async () => {
    const listingData = {
      name: '1972 Geo Metro 255K',
      category: 'Cars & Trucks',
      location: 'New York City',
      description:
        'The American auto-show highlight reel will be disproportionately concentrated on the happenings in New York.',
      pictures: undefined,
      price: 3.3
    }
    const schema = 'for-sale'
    await listings.create(listingData, schema)
    // Todo: Check that this worked after we have web3 approvals working
  })

  it('should close a listing', async () => {
    await listings.create(
      { name: 'Closing Listing', price: 1, unitsAvailable: 1 },
      ''
    )
    const listingIds = await listings.allIds()
    const listingIndex = listingIds[listingIds.length - 1]

    const listingBefore = await listings.getByIndex(listingIndex)
    expect(listingBefore.unitsAvailable).to.equal(1)

    await listings.close(listingBefore.address)

    const listingAfter = await listings.getByIndex(listingIndex)
    expect(listingAfter.unitsAvailable).to.equal(0)
  })

  describe('all', () => {
    it('should get all listings', async () => {
      const fetch = fetchMock.sandbox().mock(
        (requestUrl, opts) => {
          expect(opts.method).to.equal('GET')
          expect(requestUrl).to.equal('http://hello.world/api/listing')
          return true
        },
        {
          body: JSON.stringify({
            objects: [
              {
                contract_address: '0x4E205e04A1A8f230702fe51f3AfdCC38aafB0f3C',
                created_at: null,
                expires_at: null,
                ipfs_hash: 'QmfXRgtSbrGggApvaFCa88ofeNQP79G18DpWaSW1Wya1u8',
                price: '0.30',
                owner_address: '0x627306090abaB3A6e1400e9345bC60c78a8BEf57',
                units: 23,
                ipfs_data: {
                  name: "Taylor Swift's Reputation Tour",
                  category: 'Music',
                  description:
                    "Taylor Swift's Reputation Stadium Tour is the fifth world concert tour by American singer-songwriter Taylor Swift, in support of her sixth studio album, Reputation.",
                  location:
                    'Sports Authority Field at Mile High, Denver, CO, USA'
                }
              }
            ]
          })
        }
      )
      const listings = new Listings({
        contractService,
        ipfsService,
        fetch,
        indexingServerUrl: 'http://hello.world/api'
      })
      const all = await listings.all()
      expect(all.length).to.equal(1)
      const first = all[0]
      expect(first.address).to.equal(
        '0x4E205e04A1A8f230702fe51f3AfdCC38aafB0f3C'
      )
      expect(first.name).to.equal("Taylor Swift's Reputation Tour")
      expect(first.price).to.equal(0.3)
    })

    it('should get all listings directly from the blockchain', async () => {
      const all = await listings.all({ noIndex: true })
      expect(all.length).to.be.greaterThan(1)
      expect(all[0]).to.be.an('object').with.property('price')
      expect(all[1]).to.be.an('object').with.property('price')
    })
  })

  describe('Getting purchase addresses', async () => {
    let listing
    before(async () => {
      await listings.create({ name: 'My Listing', price: 1 }, '')
      const listingIds = await listings.allIds()
      listing = await listings.getByIndex(listingIds[listingIds.length - 1])
      await asAccount(contractService.web3, buyer, async () => {
        await listings.buy(listing.address, 1, 1)
      })
    })

    it('should get the number of purchases', async () => {
      const numPurchases = await listings.purchasesLength(listing.address)
      expect(numPurchases).to.equal(1)
    })

    it('should get the address of a purchase', async () => {
      const address = await listings.purchaseAddressByIndex(listing.address, 0)
      expect(address.slice(0, 2)).to.equal('0x')
    })
  })

  describe('update', () => {
    it('should be able to update a fractional listing', async () => {
      const tx = await listings.create({
        name: 'Sample Listing 1',
        priceWei: 1000,
        listingType: 'fractional'
      })
      const listingAddress = tx.events.NewListing.returnValues._address
      const initialListing = await listings.get(listingAddress)
      expect(initialListing.name).to.equal('Sample Listing 1')

      await listings.update(listingAddress, {
        name: 'foo bar',
        priceWei: 1000,
        listingType: 'fractional'
      })
      const updatedListing = await listings.get(listingAddress)
      expect(updatedListing.name).to.equal('foo bar')
    })
  })
})
