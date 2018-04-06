const contractDefinition = artifacts.require("./UserRegistry.sol")

// Used to assert error cases
const isEVMError = function(err) {
  let str = err.toString()
  return str.includes("revert")
}

const ipfsHash_1 =
  "0x4f32f7a7d40b4d65a917926cbfd8fd521483e7472bcc4d024179735622447dc9"
const ipfsHash_2 =
  "0xa183d4eb3552e730c2dd3df91384426eb88879869b890ad12698320d8b88cb48"

contract("UserRegistry", accounts => {
  var instance

  beforeEach(async function() {
    instance = await contractDefinition.new({ from: accounts[0] })
  })

  it('should be able to set a user', async function() {
    await instance.set(ipfsHash_1, {from: accounts[0]});
    let ipfsHash = await instance.users(accounts[0]);
    assert.equal(ipfsHash, ipfsHash_1, 'user has correct ipfsHash');
  });
});
