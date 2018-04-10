import { expect } from "chai"
import Listings from "../src/resources/listings.js"
import Purchase from "../src/resources/purchases.js"
import ContractService from "../src/contract-service.js"
import IpfsService from "../src/ipfs-service.js"
import Web3 from "web3"

describe("Purchase Resource", function() {
  this.timeout(5000) // default is 2000

  var listings
  var listing
  var purchases
  var purchase
  var contractService
  var ipfsService
  var testListingIds

  before(async () => {
    let provider = new Web3.providers.HttpProvider("http://localhost:9545")
    let web3 = new Web3(provider)
    contractService = new ContractService({ web3 })
    ipfsService = new IpfsService()
    listings = new Listings({ contractService, ipfsService })
    purchases = new Purchase({ contractService, ipfsService })
  })

  beforeEach(async () => {
    // Create a new listing and a new purchase for the tests to use.
    // Create listing:
    const listingData = {
      name: "Australorp Rooser",
      category: "For Sale",
      location: "Atlanta, GA",
      description:
        "Peaceful and dignified, Australorps are an absolutely delightful bird which we highly recommend to anyone who wants a pet chicken that lays dependably.",
      pictures: undefined,
      price: 0.2
    }
    const schema = "for-sale"
    const listingTransaction = await listings.create(listingData, schema)
    const listingEvent = listingTransaction.logs.find(
      e => e.event == "NewListing"
    )
    listing = await listings.getByIndex(listingEvent.args._index)

    // Buy listing to create a purchase
    const purchaseTransaction = await listings.buy(
      listing.address,
      1,
      listing.price - 0.1
    )
    const purchaseEvent = purchaseTransaction.logs.find(
      e => e.event == "ListingPurchased"
    )
    purchase = await purchases.get(purchaseEvent.args._purchaseContract)
  })

  it("should get a purchase", async () => {
    console.log(purchase)
    expect(purchase.stage.toNumber()).to.equal(0)
    expect(purchase.listingAddress).to.equal(listing.address)
    expect(purchase.buyerAddress).to.equal(
      await contractService.currentAccount()
    )
  })
})
