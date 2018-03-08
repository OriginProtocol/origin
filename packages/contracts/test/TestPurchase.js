const purchaseContractDefinition = artifacts.require('./Purchase.sol')
const listingContractDefinition = artifacts.require('./Listing.sol')

// Used to assert error cases
const isEVMError = function(err) {
  let str = err.toString()
  return str.includes("revert")
}

const ipfsHash = '0x6b14cac30356789cd0c39fec0acc2176c3573abdb799f3b17ccc6972ab4d39ba'
const price = 12
const unitsAvailable = 42

const AWAITING_PAYMENT = 0
const BUYER_PENDING = 1

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
    const valueToPay = (price - 1)
    await instance.buyerPay({ from: buyer, value: valueToPay })
    let newStage = await instance.stage()
    assert.notEqual(
      newStage.toNumber(),
      BUYER_PENDING,
      'stage is not BUYER_PENDING'
    )
  })

  it('should progress when buyer pays full amount', async function() {
    const valueToPay = price
    await instance.buyerPay({ from: buyer, value: valueToPay })
    let newStage = await instance.stage()
    assert.equal(
      newStage.toNumber(),
      BUYER_PENDING,
      'stage is now BUYER_PENDING'
    )
  })

  it('should progress when buyer pays full amount over multiple payments', async function() {
    const valueToPay = (price / 3)
    await instance.buyerPay({ from: buyer, value: valueToPay })
    await instance.buyerPay({ from: buyer, value: valueToPay })
    await instance.buyerPay({ from: buyer, value: valueToPay+1 }) // extra in case of division remainder
    let newStage = await instance.stage()
    assert.equal(
      newStage.toNumber(),
      BUYER_PENDING,
      'stage is now BUYER_PENDING'
    )
  })

})
