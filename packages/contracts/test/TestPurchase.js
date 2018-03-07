const purchaseContractDefinition = artifacts.require('./Purchase.sol')
const listingContractDefinition = artifacts.require('./Listing.sol')

// Used to assert error cases
const isEVMError = function(err) {
  let str = err.toString()
  return str.includes("revert")
}

const ipfsHash = '0x6b14cac30356789cd0c39fec0acc2176c3573abdb799f3b17ccc6972ab4d39ba'
const price = 0.1
const unitsAvailable = 42

contract('Purchase', accounts => {
  var buyer = accounts[0]
  var seller = accounts[1]
  var instance
  var listingInstance

  console.log("In Purchase testing.")

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

  it('should let buyer pay', async function() {
    const valuePaid = 6
    const BUYER_PENDING = 1
    await instance.buyerPay({ from: accounts[1], value: valuePaid })
    let newStage = await instance.stage()
    assert.equal(
      newStage,
      BUYER_PENDING,
      'stage is now BUYER_PENDING'
    )
  })

})
