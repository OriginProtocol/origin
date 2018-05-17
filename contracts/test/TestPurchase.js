const Purchase = artifacts.require("./Purchase.sol")
const Listing = artifacts.require("./Listing.sol")

// Used to assert error cases
const isEVMError = function(err) {
  let str = err.toString()
  return str.includes("revert")
}

const timetravel = async function(seconds) {
  var transaction = await web3.currentProvider.send({
    jsonrpc: "2.0",
    method: "evm_increaseTime",
    params: [seconds],
    id: 0
  })
  await web3.currentProvider.send({
    jsonrpc: "2.0",
    method: "evm_mine",
    params: [],
    id: 0
  })
}

const ipfsHash =
  "0x6b14cac30356789cd0c39fec0acc2176c3573abdb799f3b17ccc6972ab4d39ba"
const price = web3.toBigNumber(web3.toWei("0.5", "ether"))
const unitsAvailable = 42

// Enum values
const AWAITING_PAYMENT = 0 // Buyer hasn't paid full amount yet
const SHIPPING_PENDING = 1 // Buyer hasn't paid full amount yet
const BUYER_PENDING = 2 // Waiting for buyer to confirm receipt
const SELLER_PENDING = 3 // Waiting for seller to confirm all is good
const IN_DISPUTE = 4 // We are in a dispute
const REVIEW_PERIOD = 5 // Time for reviews (only when transaction did not go through)
const COMPLETE = 6 // It's all over

const ROLE_BUYER = 0
const ROLE_SELLER = 1

const BUYER_TIMEOUT_SECONDS = 21 * 24 * 60 * 60

contract("Purchase", accounts => {
  var buyer = accounts[0]
  var seller = accounts[1]
  var instance
  var listingInstance

  beforeEach(async function() {
    // Listing that we will be buying
    listingInstance = await Listing.new(
      seller,
      ipfsHash,
      price,
      unitsAvailable,
      { from: seller }
    )

    instance = await Purchase.new(listingInstance.address, buyer, {
      from: buyer
    })
  })

  it("should start in stage 0", async function() {
    let newStage = await instance.stage()
    assert.equal(newStage, AWAITING_PAYMENT, "stage is AWAITING_PAYMENT")
  })

  it("should fail when not enough paid", async function() {
    const valueToPay = price.minus(10)
    await instance.pay({ from: buyer, value: valueToPay })
    let newStage = await instance.stage()
    assert.notEqual(
      newStage.toNumber(),
      BUYER_PENDING,
      "stage is not BUYER_PENDING"
    )
  })

  it("should progress when buyer pays full amount", async function() {
    const valueToPay = price
    await instance.pay({ from: buyer, value: valueToPay })
    let newStage = await instance.stage()
    assert.equal(
      newStage.toNumber(),
      SHIPPING_PENDING,
      "stage should be SHIPPING_PENDING"
    )
  })

  it("should progress when buyer pays full amount over multiple payments", async function() {
    const valueToPay = price.toNumber() / 3 // Odd this doesn't work with bignumber
    await instance.pay({ from: buyer, value: valueToPay })
    await instance.pay({ from: buyer, value: valueToPay })
    await instance.pay({ from: buyer, value: valueToPay + 100 }) // extra in case of division remainder
    let newStage = await instance.stage()
    assert.equal(
      newStage.toNumber(),
      SHIPPING_PENDING,
      "stage should be SHIPPING_PENDING"
    )
  })

  it("should progress when buyer confirms receipt", async function() {
    const valueToPay = price
    await instance.pay({ from: buyer, value: valueToPay })
    await instance.sellerConfirmShipped({ from: seller })
    // We immediately confirm receipt (in real world could be a while)
    await instance.buyerConfirmReceipt(5, "", { from: buyer })
    let newStage = await instance.stage()
    assert.equal(
      newStage.toNumber(),
      SELLER_PENDING,
      "stage is now SELLER_PENDING"
    )
  })

  it("should transfer the correct amount between buyer and seller", async function() {
    const GAS_PRICE = 1

    // Before
    const buyerBalanceBefore = await web3.eth.getBalance(buyer)

    // Buyer pays
    const valueToPay = price
    const payTransaction = await instance.pay({
      from: buyer,
      value: valueToPay,
      gasPrice: GAS_PRICE
    })
    const buyerBalanceAfter = await web3.eth.getBalance(buyer)
    const buyerTransactionCost = web3.toBigNumber(
      payTransaction.receipt.gasUsed * GAS_PRICE
    )
    const buyerExpectedBalance = buyerBalanceBefore
      .minus(buyerTransactionCost)
      .minus(price)

    // Seller Ships
    const shipTransaction = await instance.sellerConfirmShipped({
      from: seller
    })
    const shipTransactionCost = web3
      .toBigNumber(shipTransaction.receipt.gasUsed)
      .times(GAS_PRICE)

    // Buyer confirms
    await instance.buyerConfirmReceipt(5, "IPFS", { from: buyer })

    // Seller collects
    const sellerBalanceBefore = await web3.eth.getBalance(seller)
    const payoutTransaction = await instance.sellerCollectPayout(
      4,
      "IPFS_HASH_HERE",
      {
        from: seller,
        gasPrice: GAS_PRICE
      }
    )
    const sellerCollectTransactionCost = web3.toBigNumber(
      payoutTransaction.receipt.gasUsed * GAS_PRICE
    )
    const sellerBalanceAfter = await web3.eth.getBalance(seller)
    const sellerExpectedBalance = sellerBalanceBefore
      .plus(price)
      // .minus(shipTransactionCost)
      .minus(sellerCollectTransactionCost)

    // console.log(`buyerBalanceBefore: ${buyerBalanceBefore}`)
    // console.log(`buyerBalanceAfter : ${buyerBalanceAfter}`)
    // console.log(`buyerdif : ${buyerBalanceAfter-buyerBalanceBefore}`)
    // console.log(`sellerBalanceBefore: ${sellerBalanceBefore}`)
    // console.log(`shipTransactionCost: ${shipTransactionCost}`)
    // console.log(`sellerCollectTransactionCost: ${sellerCollectTransactionCost}`)
    // console.log(`price : ${price}`)
    // console.log(`sellerBalanceAfter : ${sellerBalanceAfter}`)
    // console.log(`sellerExpectedBalance: ${sellerExpectedBalance}`)
    // console.log(`seller actual recieved: ${sellerBalanceAfter - sellerBalanceBefore}`)
    // console.log(`seller actual tx cost: ${sellerBalanceAfter - sellerBalanceBefore - price}`)
    // console.log(`seller spent difference: ${sellerBalanceAfter-sellerExpectedBalance}`)

    assert(
      buyerBalanceAfter.eq(buyerExpectedBalance),
      "Buyer should spend the correct amount"
    )
    assert(
      sellerBalanceAfter.eq(sellerExpectedBalance),
      "Seller should receive exactly their money"
    )
  })
})

contract("Purchase", accounts => {
  var buyer = accounts[0]
  var seller = accounts[1]
  var purchase
  var listing
  var totalPrice = 48
  var initialPayment = 6

  describe("Success path flow", async () => {
    before(async () => {
      listing = await Listing.new(
        seller,
        ipfsHash,
        totalPrice,
        unitsAvailable,
        { from: seller }
      )
    })

    it("should create and link the new purchase", async () => {
      const unitsToBuy = 1
      const buyTransaction = await listing.buyListing(unitsToBuy, {
        from: buyer,
        value: initialPayment
      })
      const listingPurchasedEvent = buyTransaction.logs.find(
        e => e.event == "ListingPurchased"
      )
      purchase = await Purchase.at(listingPurchasedEvent.args._purchaseContract)

      assert.equal(await listing.getPurchase(0), purchase.address)
      assert.equal(await purchase.listingContract(), listing.address)
      assert.equal((await purchase.stage()).toNumber(), AWAITING_PAYMENT)
    })

    it("should allow buyer to pay", async () => {
      await purchase.pay({ from: buyer, value: totalPrice - initialPayment })
      assert.equal((await purchase.stage()).toNumber(), SHIPPING_PENDING)
    })

    it("should allow seller to ship", async () => {
      await purchase.sellerConfirmShipped({ from: seller })
      assert.equal((await purchase.stage()).toNumber(), BUYER_PENDING)
    })

    it("should allow buyer to confirm reciept", async () => {
      await purchase.buyerConfirmReceipt(5, "IPFS", { from: buyer })
      assert.equal((await purchase.stage()).toNumber(), SELLER_PENDING)
    })

    it("should allow seller to collect their money", async () => {
      await purchase.sellerCollectPayout(1, "IPFS_HASH_HERE", { from: seller })
      assert.equal((await purchase.stage()).toNumber(), COMPLETE)
    })
  })

  describe("Reviews", async () => {
    const reviewIpfsHash = "DCBA1234"
    const reviewIpfsBytes =
      "0x4443424131323334000000000000000000000000000000000000000000000000"

    beforeEach(async () => {
      listing = await Listing.new(
        seller,
        ipfsHash,
        totalPrice,
        unitsAvailable,
        { from: seller }
      )
      const unitsToBuy = 1
      const buyTransaction = await listing.buyListing(unitsToBuy, {
        from: buyer,
        value: totalPrice
      })
      const listingPurchasedEvent = buyTransaction.logs.find(
        e => e.event == "ListingPurchased"
      )
      purchase = await Purchase.at(listingPurchasedEvent.args._purchaseContract)
      assert.equal((await purchase.stage()).toNumber(), SHIPPING_PENDING)
      await purchase.sellerConfirmShipped({ from: seller })
      assert.equal((await purchase.stage()).toNumber(), BUYER_PENDING)
    })

    describe("Seller review of Buyer", async () => {
      beforeEach(async () => {
        await purchase.buyerConfirmReceipt(5, "IPFS", { from: buyer })
      })

      const itShouldAllowRating = async rating => {
        it("Should allow rating " + rating, async () => {
          const transaction = await purchase.sellerCollectPayout(
            rating,
            reviewIpfsHash,
            {
              from: seller
            }
          )
          const reviewLog = transaction.logs.find(
            e => e.event == "PurchaseReview"
          )
          assert.equal(reviewLog.args.reviewer, seller, "reviewer")
          assert.equal(reviewLog.args.reviewee, buyer, "reviewee")
          assert.equal(
            reviewLog.args.revieweeRole.toNumber(),
            ROLE_BUYER,
            "revieweeRole"
          )
          assert.equal(reviewLog.args.rating, rating, "rating")
          assert.equal(reviewLog.args.ipfsHash, reviewIpfsBytes, "ipfsHash")
        })
      }

      const itShouldNotAllowRating = async rating => {
        it("Should not allow rating " + rating, async () => {
          try {
            const transaction = await purchase.sellerCollectPayout(
              rating,
              reviewIpfsHash,
              {
                from: seller
              }
            )
            assert.ok(false, "allowed an invalid rating")
          } catch (err) {
            assert.ok(isEVMError(err), "an EVM error should be thrown")
          }
        })
      }

      itShouldAllowRating(1)
      itShouldAllowRating(2)
      itShouldAllowRating(3)
      itShouldAllowRating(4)
      itShouldAllowRating(5)

      itShouldNotAllowRating(-1)
      itShouldNotAllowRating(0)
      itShouldNotAllowRating(6)
      itShouldNotAllowRating(255)
      itShouldNotAllowRating(3000)
    })

    describe("Buyer review of Seller", async () => {
      const itShouldAllowRating = async rating => {
        it("Should allow rating " + rating, async () => {
          const transaction = await purchase.buyerConfirmReceipt(
            rating,
            reviewIpfsHash,
            {
              from: buyer
            }
          )
          const reviewLog = transaction.logs.find(
            e => e.event == "PurchaseReview"
          )
          assert.equal(reviewLog.args.reviewer, buyer, "reviewer")
          assert.equal(reviewLog.args.reviewee, seller, "reviewee")
          assert.equal(
            reviewLog.args.revieweeRole.toNumber(),
            ROLE_SELLER,
            "revieweeRole"
          )
          assert.equal(reviewLog.args.rating, rating, "rating")
          assert.equal(reviewLog.args.ipfsHash, reviewIpfsBytes, "ipfsHash")
        })
      }

      const itShouldNotAllowRating = async rating => {
        it("Should not allow rating " + rating, async () => {
          try {
            const transaction = await purchase.buyerConfirmReceipt(
              rating,
              reviewIpfsHash,
              {
                from: buyer
              }
            )
            assert.ok(false, "allowed an invalid rating")
          } catch (err) {
            assert.ok(isEVMError(err), "an EVM error should be thrown")
          }
        })
      }

      itShouldAllowRating(1)
      itShouldAllowRating(2)
      itShouldAllowRating(3)
      itShouldAllowRating(4)
      itShouldAllowRating(5)

      itShouldNotAllowRating(-1)
      itShouldNotAllowRating(0)
      itShouldNotAllowRating(6)
      itShouldNotAllowRating(255)
      itShouldNotAllowRating(3000)
    })
  })

  describe("Buyer timeout", async () => {
    beforeEach(async () => {
      listing = await Listing.new(
        seller,
        ipfsHash,
        totalPrice,
        unitsAvailable,
        { from: seller }
      )
      const buyTransaction = await listing.buyListing(1, {
        from: buyer,
        value: totalPrice // Pay all so that we are in buyer pending
      })
      const listingPurchasedEvent = buyTransaction.logs.find(
        e => e.event == "ListingPurchased"
      )
      purchase = await Purchase.at(listingPurchasedEvent.args._purchaseContract)
      await timetravel(60 * 60) // Some time passes before shipping purchase
      await purchase.sellerConfirmShipped({ from: seller })
      assert.equal((await purchase.stage()).toNumber(), BUYER_PENDING)
    })

    it("should go to SELLER_PENDING when the time is up", async () => {
      await timetravel(BUYER_TIMEOUT_SECONDS + 10) // Time travel is not yet an exact science
      assert.equal((await purchase.stage()).toNumber(), SELLER_PENDING)
    })

    it("should remain BUYER_PENDING when the time is not yet up", async () => {
      await timetravel(BUYER_TIMEOUT_SECONDS - 10)
      assert.equal((await purchase.stage()).toNumber(), BUYER_PENDING)
    })
  })
})
