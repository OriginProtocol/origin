import { expect } from "chai"
import Listings from "../src/resources/listings.js"
import ContractService from "../src/contract-service.js"
import IpfsService from "../src/ipfs-service.js"

describe("Listing Resource", () => {
  var listings
  var contractService
  var ipfsService
  var testListingIds

  before(async () => {
    contractService = new ContractService()
    ipfsService = new IpfsService()
    listings = new Listings({ contractService, ipfsService })
    testListingIds = await contractService.getAllListingIds()
  })

  it("should get all listing ids", async () => {
    const ids = await listings.allIds()
    expect(ids.length).to.be.greaterThan(4)
  })

  it("should get a listing", async () => {
    const listing = await listings.getByIndex(testListingIds[0])
    expect(listing.name).to.equal("Zinc House")
    expect(listing.index).to.equal(testListingIds[0])
  })

  it("should buy a listing", async () => {
    const listing = await listings.getByIndex(testListingIds[0])
    const transaction = await listings.buy(
      listing.address,
      1,
      listing.price * 1
    )
    //Todo: Currently this test will fail here with a timeout
    //  because we need to somehow get web3 approve this transaction
    // Todo: wait for transaction, then check that purchase was created.
  }).timeout(5000)

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
})
