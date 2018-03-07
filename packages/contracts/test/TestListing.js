const contractDefinition = artifacts.require('./Listing.sol')

// Used to assert error cases
const isEVMError = function(err) {
  let str = err.toString()
  return str.includes("revert")
}

const ipfsHash = '0x6b14cac30356789cd0c39fec0acc2176c3573abdb799f3b17ccc6972ab4d39ba'
const price = 0.1
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

  // We're changing how purchasing is done...

  // it('should be able to buy a listing', async function() {
  //   const unitsToBuy = 2
  //   await instance.buyListing(unitsToBuy, { from: accounts[1], value: 6 })
  //   let newUnitsAvailable = await instance.unitsAvailable()
  //   assert.equal(
  //     newUnitsAvailable,
  //     (unitsAvailable - unitsToBuy),
  //     'units available has decreased'
  //   )
  // })

})
