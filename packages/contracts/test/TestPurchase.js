const purchaseContractDefinition = artifacts.require('./Purchase.sol')
const listingContractDefinition = artifacts.require('./Listing.sol')

// Used to assert error cases
const isEVMError = function(err) {
  let str = err.toString()
  return str.includes("revert")
}

const ipfsHash = '0x6b14cac30356789cd0c39fec0acc2176c3573abdb799f3b17ccc6972ab4d39ba'
const price = web3.toBigNumber(web3.toWei('0.5', 'ether'))
const unitsAvailable = 42

// Enum values
const AWAITING_PAYMENT = 0 // Buyer hasn't paid full amount yet
const BUYER_PENDING = 1 // Waiting for buyer to confirm receipt
const SELLER_PENDING = 2 // Waiting for seller to confirm all is good
const IN_DISPUTE = 3 // We are in a dispute
const REVIEW_PERIOD = 4 // Time for reviews (only when transaction did not go through)
const COMPLETE = 5 // It's all over

contract('Purchase', accounts => {
  var buyer = accounts[0]
  var seller = accounts[1]
  var instance
  var listingInstance

  beforeEach(async function() {
    // Listing that we will be buying
    listingInstance = await listingContractDefinition.new(
        seller,
        ipfsHash,
        price,
        unitsAvailable,
        {from: seller}
    )

    instance = await purchaseContractDefinition.new(
      listingInstance.address,
      buyer,
      {from: buyer}
    )
  })

  it('should start in stage 0', async function() {
    let newStage = await instance.stage()
    assert.equal(
      newStage,
      AWAITING_PAYMENT,
      'stage is AWAITING_PAYMENT'
    )
  })

  it('should fail when not enough paid', async function() {
    const valueToPay = (price.minus(10))
    await instance.pay({ from: buyer, value: valueToPay })
    let newStage = await instance.stage()
    assert.notEqual(
      newStage.toNumber(),
      BUYER_PENDING,
      'stage is not BUYER_PENDING'
    )
  })

  it('should progress when buyer pays full amount', async function() {
    const valueToPay = price
    await instance.pay({ from: buyer, value: valueToPay })
    let newStage = await instance.stage()
    assert.equal(
      newStage.toNumber(),
      BUYER_PENDING,
      'stage is now BUYER_PENDING'
    )
  })

  it('should progress when buyer pays full amount over multiple payments', async function() {
    const valueToPay = price.toNumber() / 3 // Odd this doesn't work with bignumber
    await instance.pay({ from: buyer, value: valueToPay })
    await instance.pay({ from: buyer, value: valueToPay })
    await instance.pay({ from: buyer, value: valueToPay+100 }) // extra in case of division remainder
    let newStage = await instance.stage()
    assert.equal(
      newStage.toNumber(),
      BUYER_PENDING,
      'stage is now BUYER_PENDING'
    )
  })

  it('should progress when buyer confirms receipt', async function() {
    const valueToPay = price
    await instance.pay({ from: buyer, value: valueToPay })
    // We immediately confirm receipt (in real world could be a while)
    await instance.buyerConfirmReceipt({ from: buyer })
    let newStage = await instance.stage()
    assert.equal(
      newStage.toNumber(),
      SELLER_PENDING,
      'stage is now SELLER_PENDING'
    )
  })

  it('should leave seller with more money and buyer with less', async function() {
    let sellerBalanceBefore = await web3.eth.getBalance(seller)

    let buyerBalanceBefore = await web3.eth.getBalance(buyer)

    const valueToPay = price
    await instance.pay({ from: buyer, value: valueToPay })

    let buyerBalanceAfter = await web3.eth.getBalance(buyer)

    await instance.buyerConfirmReceipt({ from: buyer })
    await instance.sellerGetPayout({ from: seller })
    let sellerBalanceAfter = await web3.eth.getBalance(seller)

    // console.log(`sellerBalanceBefore: ${sellerBalanceBefore}`)
    // console.log(`buyerBalanceBefore: ${buyerBalanceBefore}`)
    // console.log(`buyerBalanceAfter : ${buyerBalanceAfter}`)
    // console.log(`sellerBalanceAfter : ${sellerBalanceAfter}`)
    // console.log(`buyerdif : ${buyerBalanceAfter-buyerBalanceBefore}`)
    // console.log(`sellerdif: ${sellerBalanceAfter-sellerBalanceBefore}`)

    let newStage = await instance.stage()
    assert.equal(
      ((buyerBalanceAfter-buyerBalanceBefore) < 0) &&
        ((sellerBalanceAfter-sellerBalanceBefore) > 0),
      true,
      'seller made money and buyer lost money'
    )
  })

})
