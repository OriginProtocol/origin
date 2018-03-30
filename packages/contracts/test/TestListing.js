const contractDefinition = artifacts.require('./Listing.sol')

// Used to assert error cases
const isEVMError = function(err) {
  let str = err.toString()
  return str.includes("revert")
}

const ipfsHash = '0x6b14cac30356789cd0c39fec0acc2176c3573abdb799f3b17ccc6972ab4d39ba'
const price = 33
const unitsAvailable = 42

contract('Listing', accounts => {
  var owner = accounts[0]
  var notOwner = accounts[1]
  var instance

  beforeEach(async function() {
    instance = await contractDefinition.new(
      owner,
      ipfsHash,
      price,
      unitsAvailable,
      {from: owner}
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
    instance.buyListing(
      unitsToBuy,
      { from: accounts[1], value: 6 }
    )

    // TODO: How to catch events emitted during test?
    // https://ethereum.stackexchange.com/questions/15353/how-to-listen-for-contract-events-in-javascript-tests
    // https://github.com/ethereum/web3.js/issues/1023#issuecomment-350791050
    // We should test that `Purchase` contract was created and has value
    // sent to it.

    // console.log(purchaseContract)
    let newUnitsAvailable = await instance.unitsAvailable()
    assert.equal(
      newUnitsAvailable,
      (unitsAvailable - unitsToBuy),
      'units available has decreased'
    )
  })

})
