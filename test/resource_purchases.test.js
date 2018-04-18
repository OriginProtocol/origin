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
  var web3

  before(async () => {
    let provider = new Web3.providers.HttpProvider("http://localhost:9545")
    web3 = new Web3(provider)
    contractService = new ContractService({ web3 })
    ipfsService = new IpfsService()
    listings = new Listings({ contractService, ipfsService })
    purchases = new Purchase({ contractService, ipfsService })
  })

  // Helpers
  // -----

  let resetListingAndPurchase = async () => {
    // Create a new listing and a new purchase for the tests to use.
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
  }

  let expectStage = function(expectedStage) {
    expect(purchase.stage).to.equal(expectedStage)
  }

  // Tests
  // -----

  describe("simple purchase flow", async () => {
    before(async () => {
      await resetListingAndPurchase()
    })

    it("should get a purchase", async () => {
      expectStage("awaiting_payment")
      expect(purchase.listingAddress).to.equal(listing.address)
      expect(purchase.buyerAddress).to.equal(
        await contractService.currentAccount()
      )
    })

    it("should allow the buyer to pay", async () => {
      expectStage("awaiting_payment")
      await purchases.pay(
        purchase.address,
        contractService.web3.toWei("0.1", "ether")
      )
      purchase = await purchases.get(purchase.address)
      expectStage("shipping_pending")
    })

    it("should allow the seller to mark as shipped", async () => {
      expectStage("shipping_pending")
      await purchases.sellerConfirmShipped(purchase.address)
      purchase = await purchases.get(purchase.address)
      expectStage("buyer_pending")
    })

    it("should allow the buyer to mark a purchase received", async () => {
      expectStage("buyer_pending")
      await purchases.buyerConfirmReceipt(purchase.address)
      purchase = await purchases.get(purchase.address)
      expectStage("seller_pending")
    })

    it("should allow the seller to collect money", async () => {
      expectStage("seller_pending")
      await purchases.sellerGetPayout(purchase.address)
      purchase = await purchases.get(purchase.address)
      expectStage("complete")
    })
  })

  describe("transactions have a whenMined promise", async () => {
    before(async () => {
      await resetListingAndPurchase()
    })

    it("should allow us to wait for a transaction to be mined", async () => {
      const transaction = await purchases.pay(
        purchase.address,
        contractService.web3.toWei("0.1", "ether")
      )
      await transaction.whenFinished()
    })
  })
})
