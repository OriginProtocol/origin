import { expect } from "chai"
import Listings from "../src/resources/listings.js"
import ContractService from "../src/services/contract-service"
import IpfsService from "../src/services/ipfs-service.js"
import Web3 from "web3"

describe("Listing Resource", function() {
  this.timeout(5000) // default is 2000

  var listings
  var contractService
  var ipfsService
  var testListingIds

  before(async () => {
    let provider = new Web3.providers.HttpProvider("http://localhost:8545")
    let web3 = new Web3(provider)
    contractService = new ContractService({ web3 })
    ipfsService = new IpfsService({
      ipfsDomain: "127.0.0.1",
      ipfsApiPort: "5002",
      ipfsGatewayPort: "8080",
      ipfsGatewayProtocol: "http"
    })
    listings = new Listings({ contractService, ipfsService })
    testListingIds = await contractService.getAllListingIds()

    // Ensure that there are at least 2 sample listings
    await listings.create({ name: "Sample Listing 1", price: 1 }, "")
    await listings.create({ name: "Sample Listing 2", price: 1 }, "")
  })

  it("should get all listing ids", async () => {
    const ids = await listings.allIds()
    expect(ids.length).to.be.greaterThan(1)
  })

  it("should get a listing by index", async () => {
    await listings.create({ name: "Foo Bar", price: 1 }, "")
    let listingIds = await contractService.getAllListingIds()
    const listing = await listings.getByIndex(listingIds[listingIds.length - 1])
    expect(listing.name).to.equal("Foo Bar")
    expect(listing.index).to.equal(listingIds.length - 1)
  })

  it("should get a listing by address", async () => {
    await listings.create({ name: "Foo Bar", price: 1 }, "")
    let listingIds = await contractService.getAllListingIds()
    const listingFromIndex = await listings.getByIndex(
      listingIds[listingIds.length - 1]
    )
    const listing = await listings.get(listingFromIndex.address)
    expect(listing.name).to.equal("Foo Bar")
  })

  it("should buy a listing", async () => {
    await listings.create({ name: "My Listing", price: 1 }, "")
    let listingIds = await contractService.getAllListingIds()
    const listing = await listings.getByIndex(listingIds[listingIds.length - 1])
    const transaction = await listings.buy(
      listing.address,
      1,
      listing.price * 1
    )
  })

  it("should create a listing", async () => {
    const listingData = {
      name: "1972 Geo Metro 255K",
      category: "Cars & Trucks",
      location: "New York City",
      description:
        "The American auto-show highlight reel will be disproportionately concentrated on the happenings in New York.",
      pictures: undefined,
      price: 3.3
    }
    const schema = "for-sale"
    await listings.create(listingData, schema)
    // Todo: Check that this worked after we have web3 approvals working
  })

  it("should close a listing", async () => {
    await listings.create(
      { name: "Closing Listing", price: 1, unitsAvailable: 1 },
      ""
    )
    let listingIds = await contractService.getAllListingIds()
    const listingIndex = listingIds[listingIds.length - 1]

    const listingBefore = await listings.getByIndex(listingIndex)
    expect(listingBefore.unitsAvailable).to.equal(1)

    await listings.close(listingBefore.address)

    const listingAfter = await listings.getByIndex(listingIndex)
    expect(listingAfter.unitsAvailable).to.equal(0)
  })

  describe("Getting purchase addresses", async () => {
    var listing
    before(async () => {
      await listings.create({ name: "My Listing", price: 1 }, "")
      const listingIds = await contractService.getAllListingIds()
      listing = await listings.getByIndex(listingIds[listingIds.length - 1])
      const transaction = await listings.buy(listing.address, 1, 1)
    })

    it("should get the number of purchases", async () => {
      const numPurchases = await listings.purchasesLength(listing.address)
      expect(numPurchases).to.equal(1)
    })

    it("should get the address of a purchase", async () => {
      const address = await listings.purchaseAddressByIndex(listing.address, 0)
      expect(address.slice(0, 2)).to.equal("0x")
    })
  })
})
