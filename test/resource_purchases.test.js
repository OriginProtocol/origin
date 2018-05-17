import { expect } from "chai"
import Listings from "../src/resources/listings.js"
import Purchase from "../src/resources/purchases.js"
import Review from "../src/resources/reviews.js"
import ContractService from "../src/services/contract-service"
import IpfsService from "../src/services/ipfs-service.js"
import Web3 from "web3"

describe("Purchase Resource", function() {
  this.timeout(5000) // default is 2000

  var listings
  var listing
  var purchases
  var purchase
  var reviews
  var contractService
  var ipfsService
  var testListingIds
  var web3

  before(async () => {
    let provider = new Web3.providers.HttpProvider("http://localhost:8545")
    web3 = new Web3(provider)
    contractService = new ContractService({ web3 })
    ipfsService = new IpfsService({
      ipfsDomain: "127.0.0.1",
      ipfsApiPort: "5002",
      ipfsGatewayPort: "8080",
      ipfsGatewayProtocol: "http"
    })
    listings = new Listings({ contractService, ipfsService })
    purchases = new Purchase({ contractService, ipfsService })
    reviews = new Review({ contractService, ipfsService })
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

    const listingEvent = listingTransaction.events.NewListing
    listing = await listings.getByIndex(listingEvent.returnValues._index)

    // Buy listing to create a purchase
    const purchaseTransaction = await listings.buy(
      listing.address,
      1,
      listing.price - 0.1
    )
    const purchaseEvent = purchaseTransaction.events.ListingPurchased
    purchase = await purchases.get(purchaseEvent.returnValues._purchaseContract)
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
        contractService.web3.utils.toWei("0.1", "ether")
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
      await purchases.buyerConfirmReceipt(purchase.address, { rating: 3 })
      purchase = await purchases.get(purchase.address)
      expectStage("seller_pending")
    })

    it("should allow the seller to collect money", async () => {
      expectStage("seller_pending")
      var reviewText = "Some delay before marking purchase recieved"
      await purchases.sellerGetPayout(purchase.address, {
        rating: 4,
        reviewText: reviewText
      })
      purchase = await purchases.get(purchase.address)
      expectStage("complete")
      const purchaseReviews = await reviews.find({
        purchaseAddress: purchase.address
      })
      expect(purchaseReviews[1].rating).to.equal(4)
      expect(purchaseReviews[1].revieweeAddress).to.equal(purchase.buyerAddress)
      expect(purchaseReviews[1].revieweeRole).to.equal("BUYER")
    })

    it("should list logs", async () => {
      var logs = await purchases.getLogs(purchase.address)
      expect(logs[0].stage).to.equal("awaiting_payment")
      expect(logs[1].stage).to.equal("shipping_pending")
      expect(logs[2].stage).to.equal("buyer_pending")
      expect(logs[3].stage).to.equal("seller_pending")
      expect(logs[4].stage).to.equal("complete")
    })
  })

  describe("transactions have a whenMined promise", async () => {
    before(async () => {
      await resetListingAndPurchase()
    })

    it("should allow us to wait for a transaction to be mined", async () => {
      const transaction = await purchases.pay(
        purchase.address,
        contractService.web3.utils.toWei("0.1", "ether")
      )
      await transaction.whenFinished()
    })
  })
})
