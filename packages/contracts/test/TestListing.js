const contractDefinition = artifacts.require('./Listing.sol');

// Used to assert error cases
const isEVMError = function(err) {
  let str = err.toString();
  return str.includes("revert");
}

contract('Listing', accounts => {
  var owner = accounts[0];
  var notOwner = accounts[1];
  var instance;

  beforeEach(async function() {
    instance = await contractDefinition.new({from: owner});
  });

  it('should have owner as owner of contract', async function() {
    let contractOwner = await instance.owner_address();
    assert.equal(contractOwner, owner);
  });

  it('should deploy with 5 listsings', async function() {
    let listingCount = await instance.listingsLength();
    assert.equal(listingCount, 5);
  });

  xit('should be able to remove a listing', async function() {
  });

  xit('should be able to create a listing', async function() {
  });

  xit('should be able to buy a listing', async function() {
  });

});
