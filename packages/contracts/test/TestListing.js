const contractDefinition = artifacts.require('./Listing.sol')
const purchaseDefinition = artifacts.require('./Purchase.sol')

// Used to assert error cases
const isEVMError = function(err) {
  let str = err.toString()
  return str.includes("revert")
}

const ipfsHash = '0x6b14cac30356789cd0c39fec0acc2176c3573abdb799f3b17ccc6972ab4d39ba'
const price = 33
const unitsAvailable = 42

contract('Listing', accounts => {
  var seller = accounts[0]
  var buyer = accounts[1]
  var instance

  beforeEach(async function() {
    instance = await contractDefinition.new(
      seller,
      ipfsHash,
      price,
      unitsAvailable,
      {from: seller}
    )
  })

  it('should have correct price', async function() {
    let newPrice = await instance.price()
    assert.equal(
      newPrice,
      price,
      'price is correct'
    )
  })


  it('should be able to buy a listing', async function() {
    const unitsToBuy = 1 // TODO: Handle multiple units
    const buyTransaction = await instance.buyListing(
      unitsToBuy,
      { from: buyer, value: 6 }
    )
    const listingPurchasedEvent = buyTransaction.logs.find((e)=>e.event=="ListingPurchased")
    const purchaseContract = purchaseDefinition.at(listingPurchasedEvent.args._purchaseContract)

    let newUnitsAvailable = await instance.unitsAvailable()
    assert.equal(
      newUnitsAvailable,
      (unitsAvailable - unitsToBuy),
      'units available has decreased'
    )

    assert.equal(
      buyer,
      await purchaseContract.buyer()
    )
  })

})
